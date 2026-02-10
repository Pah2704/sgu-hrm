import { IsOptional, IsString, IsEnum } from 'class-validator';
import { EmployeeStatus } from '@prisma/client';

export class EmployeeQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string; // Search by name or code

  @IsOptional()
  @IsString()
  unitId?: string; // Filter by unit (and sub-units if implemented)

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
