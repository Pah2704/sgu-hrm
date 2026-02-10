import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PositionType } from '@prisma/client';

export class CreatePositionDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(PositionType)
  positionType: PositionType;

  @IsInt()
  @IsOptional()
  level?: number;
}
