import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Unit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto } from './dto';

// Tree node shape for API response
export interface TreeUnitDto {
  id: string;
  code: string;
  name: string;
  shortName: string | null;
  unitType: string;
  status: string;
  level: number;
  sortOrder: number;
  parentId: string | null;
  children: TreeUnitDto[];
}

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /units — return nested tree of all units
   */
  async getTree(): Promise<TreeUnitDto[]> {
    const units = await this.prisma.unit.findMany({
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });

    return this.buildTree(units);
  }

  /**
   * GET /units/:id — single unit detail
   */
  async findOne(id: string): Promise<Unit> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
        _count: { select: { employees: true } },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with id "${id}" not found`);
    }

    return unit;
  }

  /**
   * POST /units — create a new unit, compute path and level from parent
   */
  async create(dto: CreateUnitDto): Promise<Unit> {
    // Check code uniqueness
    const existing = await this.prisma.unit.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Unit code "${dto.code}" already exists`);
    }

    let path = dto.code.toLowerCase();
    let level = 0;

    // If parent specified, compute path and level
    if (dto.parentId) {
      const parent = await this.prisma.unit.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent unit with id "${dto.parentId}" not found`,
        );
      }
      path = `${parent.path}.${dto.code.toLowerCase()}`;
      level = parent.level + 1;
    }

    return this.prisma.unit.create({
      data: {
        code: dto.code,
        name: dto.name,
        shortName: dto.shortName,
        parentId: dto.parentId || null,
        unitType: dto.unitType,
        path,
        level,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * PATCH /units/:id — update unit, recalculate path if parent changed
   */
  async update(id: string, dto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with id "${id}" not found`);
    }

    // Prevent setting parent to self
    if (dto.parentId && dto.parentId === id) {
      throw new BadRequestException('A unit cannot be its own parent');
    }

    let newPath = unit.path;
    let newLevel = unit.level;

    // If parent changed, recalculate path for this unit + descendants
    if (dto.parentId !== undefined && dto.parentId !== unit.parentId) {
      if (dto.parentId) {
        // Prevent circular reference: new parent cannot be a descendant
        const newParent = await this.prisma.unit.findUnique({
          where: { id: dto.parentId },
        });
        if (!newParent) {
          throw new NotFoundException(
            `Parent unit with id "${dto.parentId}" not found`,
          );
        }
        if (newParent.path?.startsWith(`${unit.path}.`)) {
          throw new BadRequestException(
            'Cannot set a descendant as parent (circular reference)',
          );
        }
        newPath = `${newParent.path}.${unit.code.toLowerCase()}`;
        newLevel = newParent.level + 1;
      } else {
        // Moving to root
        newPath = unit.code.toLowerCase();
        newLevel = 0;
      }

      // Update descendants' paths
      const oldPath = unit.path;
      if (oldPath) {
        await this.updateDescendantPaths(
          oldPath,
          newPath,
          newLevel - unit.level,
        );
      }
    }

    return this.prisma.unit.update({
      where: { id },
      data: {
        name: dto.name,
        shortName: dto.shortName,
        parentId: dto.parentId !== undefined ? dto.parentId || null : undefined,
        unitType: dto.unitType,
        status: dto.status,
        sortOrder: dto.sortOrder,
        path: newPath,
        level: newLevel,
      },
    });
  }

  /**
   * DELETE /units/:id — soft-delete (set status = INACTIVE)
   */
  async remove(id: string): Promise<Unit> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with id "${id}" not found`);
    }

    // Prevent deletion if unit has active employees
    if (unit._count.employees > 0) {
      throw new BadRequestException(
        'Cannot deactivate a unit that has active employees. Transfer employees first.',
      );
    }

    return this.prisma.unit.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  /**
   * GET /units/:id/employees — list employees in a unit
   * Returns basic employee info; full profiles handled by Employee module (Slice 3)
   */
  async getEmployees(unitId: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      throw new NotFoundException(`Unit with id "${unitId}" not found`);
    }

    return this.prisma.employee.findMany({
      where: { unitId, status: 'WORKING' },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        currentPosition: true,
        status: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Build nested tree from flat list of units
   */
  private buildTree(units: Unit[]): TreeUnitDto[] {
    const map = new Map<string, TreeUnitDto>();
    const roots: TreeUnitDto[] = [];

    // Create map of all nodes
    for (const unit of units) {
      map.set(unit.id, {
        id: unit.id,
        code: unit.code,
        name: unit.name,
        shortName: unit.shortName,
        unitType: unit.unitType,
        status: unit.status,
        level: unit.level,
        sortOrder: unit.sortOrder,
        parentId: unit.parentId,
        children: [],
      });
    }

    // Build parent→children relationships
    for (const unit of units) {
      const node = map.get(unit.id)!;
      if (unit.parentId && map.has(unit.parentId)) {
        map.get(unit.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Update path and level for all descendants when a parent changes
   */
  private async updateDescendantPaths(
    oldPath: string,
    newPath: string,
    levelDiff: number,
  ): Promise<void> {
    // Find all descendants whose path starts with oldPath.
    const descendants = await this.prisma.unit.findMany({
      where: {
        path: { startsWith: `${oldPath}.` },
      },
    });

    // Batch update each descendant's path and level
    for (const desc of descendants) {
      const updatedPath = desc.path!.replace(oldPath, newPath);
      await this.prisma.unit.update({
        where: { id: desc.id },
        data: {
          path: updatedPath,
          level: desc.level + levelDiff,
        },
      });
    }
  }
}
