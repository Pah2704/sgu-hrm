import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateDecisionDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  positionId: string;

  @IsBoolean()
  isPrimary: boolean;

  @IsDateString()
  appointDate: string;

  @IsString()
  @IsOptional()
  decisionNo?: string;

  @IsDateString()
  @IsOptional()
  decisionDate?: string;

  @IsString()
  @IsOptional()
  documentUrl?: string;
}
