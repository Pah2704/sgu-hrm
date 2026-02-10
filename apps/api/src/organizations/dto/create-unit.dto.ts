import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { UnitType } from '@prisma/client';

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsEnum(UnitType)
  unitType: UnitType;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
