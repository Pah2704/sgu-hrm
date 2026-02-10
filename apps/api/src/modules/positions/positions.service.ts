import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto) {
    return this.prisma.position.create({
      data: createPositionDto,
    });
  }

  async findAll() {
    return this.prisma.position.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.position.findUnique({
      where: { id },
    });
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    return this.prisma.position.update({
      where: { id },
      data: updatePositionDto,
    });
  }

  async remove(id: string) {
    // Soft delete logic or check if used before delete
    // For now, strict delete
    return this.prisma.position.delete({
      where: { id },
    });
  }
}
