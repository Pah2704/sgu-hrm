import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';

@Injectable()
export class DecisionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDecisionDto: CreateDecisionDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. If new position is primary, close the current primary position
      if (createDecisionDto.isPrimary) {
        const currentPrimary = await tx.employeePosition.findFirst({
          where: {
            employeeId: createDecisionDto.employeeId,
            isPrimary: true,
            endDate: null,
          },
        });

        if (currentPrimary) {
          // Close it effective yesterday or same day?
          // Using appointDate of new position as endDate of old one implies seamless transition
          await tx.employeePosition.update({
            where: { id: currentPrimary.id },
            data: { endDate: createDecisionDto.appointDate },
          });
        }

        // Update Employee's currentPosition string for quick access/display
        const pos = await tx.position.findUnique({
          where: { id: createDecisionDto.positionId },
        });
        if (pos) {
          await tx.employee.update({
            where: { id: createDecisionDto.employeeId },
            data: {
              currentPosition: pos.name,
              appointDate: new Date(createDecisionDto.appointDate),
            },
          });
        }
      }

      // 2. Create the new record
      return tx.employeePosition.create({
        data: {
          employeeId: createDecisionDto.employeeId,
          positionId: createDecisionDto.positionId,
          isPrimary: createDecisionDto.isPrimary,
          appointDate: createDecisionDto.appointDate,
          decisionNo: createDecisionDto.decisionNo,
          decisionDate: createDecisionDto.decisionDate,
          documentUrl: createDecisionDto.documentUrl,
        },
        include: { position: true },
      });
    });
  }

  async findAllByEmployee(employeeId: string) {
    return this.prisma.employeePosition.findMany({
      where: { employeeId },
      include: { position: true },
      orderBy: { appointDate: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.employeePosition.findUnique({
      where: { id },
      include: { position: true },
    });
  }

  async update(id: string, updateDecisionDto: UpdateDecisionDto) {
    return this.prisma.employeePosition.update({
      where: { id },
      data: updateDecisionDto,
    });
  }

  remove(id: string) {
    void id;
    // START_TODO: Enforce "history records are never hard-deleted"
    // Instead of delete, we might just throw error or set status to INACTIVE/CANCELLED if schema supported it.
    // For now, allow DELETE only if it was created by mistake?
    // Or strictly forbid:
    throw new BadRequestException(
      'History records cannot be deleted. Please set endDate to close the position.',
    );
    // END_TODO
  }
}
