import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { ContractType, ContractStatus } from '@prisma/client';

export class CreateContractDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  contractNumber: string;

  @IsEnum(ContractType)
  @IsNotEmpty()
  contractType: ContractType;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  signedDate?: string;

  @IsUrl()
  @IsOptional()
  originalFileUrl?: string;

  @IsUrl()
  @IsOptional()
  signedFileUrl?: string;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
