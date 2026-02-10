import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { UnitType, UnitStatus } from '@prisma/client';

export class UpdateUnitDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsEnum(UnitType)
  @IsOptional()
  unitType?: UnitType;

  @IsEnum(UnitStatus)
  @IsOptional()
  status?: UnitStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
