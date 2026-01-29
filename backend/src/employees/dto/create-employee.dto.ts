import { IsEnum, IsString, IsNotEmpty, IsOptional, IsDateString, IsEmail } from 'class-validator';
import { Gender, EmployeeStatus, EmployeeType } from '../entities/employee.entity';

export class CreateEmployeeDto {
    @IsEnum(EmployeeType)
    @IsOptional()
    type?: EmployeeType;

    @IsString()
    @IsNotEmpty()
    citizenId: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsDateString()
    dob: Date;

    @IsEnum(Gender)
    gender: Gender;

    @IsString()
    @IsOptional()
    email?: string;

    // Allow other fields to be passed loosely for now to speed up development
    // In a strict environment, we would define all 50+ fields here.
    [key: string]: any;
}
