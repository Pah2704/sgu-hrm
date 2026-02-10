import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all users (admin only)
   */
  async findAll(params: { skip?: number; take?: number } = {}) {
    const { skip = 0, take = 50 } = params;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          roles: {
            select: {
              role: {
                select: { name: true, displayName: true },
              },
            },
          },
          employee: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        roles: u.roles.map((r) => r.role),
      })),
      meta: { total, skip, take },
    };
  }

  /**
   * Get user by ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
            unit: {
              select: { id: true, name: true },
            },
          },
        },
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            avatarUrl: true,
            unit: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      roles: user.roles.map((r) => ({ ...r.role, unit: r.unit })),
    };
  }

  /**
   * Create new user (admin only)
   */
  async create(dto: CreateUserDto) {
    // Check email uniqueness
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        isActive: dto.isActive ?? true,
        roles: dto.roleIds?.length
          ? {
              create: dto.roleIds.map((roleId) => ({
                roleId,
                unitId: dto.unitId,
              })),
            }
          : undefined,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.email) updateData.email = dto.email;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    // Update roles if provided
    if (dto.roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      await this.prisma.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({
          userId: id,
          roleId,
          unitId: dto.unitId,
        })),
      });
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Soft delete user (deactivate)
   */
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }
}
