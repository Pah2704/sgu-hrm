import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContractDto: CreateContractDto) {
    const { employeeId, ...rest } = createContractDto;

    // Verify employee exists? Prisma foreign key constraint handles this,
    // but explicit check gives better error. For now, rely on Prisma.

    return this.prisma.contract.create({
      data: {
        ...rest,
        startDate: new Date(rest.startDate),
        endDate: rest.endDate ? new Date(rest.endDate) : null,
        signedDate: rest.signedDate ? new Date(rest.signedDate) : null,
        employee: { connect: { id: employeeId } },
      },
    });
  }

  async findAll(employeeId?: string) {
    const where: Prisma.ContractWhereInput = {};
    if (employeeId) {
      where.employeeId = employeeId;
    }

    return this.prisma.contract.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
          },
        },
        appendices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract #${id} not found`);
    }
    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto) {
    await this.findOne(id); // Ensure exists

    const { employeeId, startDate, endDate, signedDate, ...rest } =
      updateContractDto;
    const data: Prisma.ContractUpdateInput = {
      ...rest,
    };

    if (startDate) {
      data.startDate = new Date(startDate);
    }
    if (endDate) {
      data.endDate = new Date(endDate);
    }
    if (signedDate) {
      data.signedDate = new Date(signedDate);
    }

    // If employeeId is allow to be changed (rare)
    if (employeeId) {
      data.employee = { connect: { id: employeeId } };
    }

    return this.prisma.contract.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contract.delete({ where: { id } });
  }
}
