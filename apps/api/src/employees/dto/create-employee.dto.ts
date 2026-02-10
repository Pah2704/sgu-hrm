import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { Gender, EmployeeStatus } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @IsString()
  @IsNotEmpty()
  citizenId: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  aliasName?: string;

  @IsDateString()
  @IsNotEmpty()
  dob: string; // ISO Date

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  unitId: string;

  // JSON fields - explicit typing or Allow objects
  @IsOptional()
  placeOfBirth?: any;

  @IsOptional()
  hometown?: any;

  @IsOptional()
  currentAddress?: any;

  @IsDateString()
  @IsOptional()
  initialRecruitmentDate?: string;

  @IsDateString()
  @IsOptional()
  currentOrgJoinDate?: string;

  @IsDateString()
  @IsOptional()
  officialDate?: string;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}
