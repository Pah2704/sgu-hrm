import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { EmployeeStatus, Prisma } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { email, citizenId, employeeCode } = createEmployeeDto;
    if (!email) {
      throw new BadRequestException('Email is required to create employee');
    }

    // 1. Check uniqueness for Critical Fields
    const existing = await this.prisma.employee.findFirst({
      where: {
        OR: [{ employeeCode }, { citizenId }, { email }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'Employee with this Code, Citizen ID, or Email already exists',
      );
    }

    // 2. Prepare User creation if email is present
    let userId: string;

    // Hash password (default to citizenId)
    // Note: In a real app, send welcome email with set-password link
    const saltRounds = 10;
    const defaultPassword = citizenId;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    return this.prisma.$transaction(async (tx) => {
      // Create User if email provided
      // Check if user exists (could be a guest user without employee profile)
      const existingUser = await tx.user.findUnique({
        where: { email },
        include: { employee: { select: { id: true } } },
      });

      if (existingUser) {
        if (existingUser.employee) {
          throw new ConflictException(
            'User already linked to another employee',
          );
        }
        userId = existingUser.id;
      } else {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            isActive: true,
            roles: {
              create: {
                role: { connect: { name: 'EMPLOYEE' } },
              },
            },
          },
        });
        userId = newUser.id;
      }

      // 3. Create Employee
      return tx.employee.create({
        data: {
          ...createEmployeeDto,
          dob: new Date(createEmployeeDto.dob),
          initialRecruitmentDate: createEmployeeDto.initialRecruitmentDate
            ? new Date(createEmployeeDto.initialRecruitmentDate)
            : null,
          currentOrgJoinDate: createEmployeeDto.currentOrgJoinDate
            ? new Date(createEmployeeDto.currentOrgJoinDate)
            : null,
          officialDate: createEmployeeDto.officialDate
            ? new Date(createEmployeeDto.officialDate)
            : null,
          userId, // Link if created
        },
      });
    });
  }

  async findAll(query: EmployeeQueryDto) {
    const { page = '1', limit = '10', search, unitId, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // TODO: Implement unit tree filter (path-based)

    const where: Prisma.EmployeeWhereInput = {};
    if (status) where.status = status;
    if (unitId) where.unitId = unitId; // Should be expanded to children
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take,
        include: { unit: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { data, total, page: Number(page), limit: take };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        unit: true,
        relationships: true,
        contracts: true, // Optional: verify security policy for reading detailed relations
      },
    });
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    // Check exist
    await this.findOne(id);

    const {
      dob,
      initialRecruitmentDate,
      currentOrgJoinDate,
      officialDate,
      ...rest
    } = updateEmployeeDto;

    const data: Prisma.EmployeeUpdateInput = {
      ...rest,
    };

    if (dob) {
      data.dob = new Date(dob);
    }
    if (initialRecruitmentDate) {
      data.initialRecruitmentDate = new Date(initialRecruitmentDate);
    }
    if (currentOrgJoinDate) {
      data.currentOrgJoinDate = new Date(currentOrgJoinDate);
    }
    if (officialDate) {
      data.officialDate = new Date(officialDate);
    }

    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: EmployeeStatus) {
    return this.prisma.employee.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    // Soft delete usually prefers updateStatus, but if DELETE is requested:
    return this.prisma.employee.delete({ where: { id } });
  }
}
