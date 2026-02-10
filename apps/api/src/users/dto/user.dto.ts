import {
  IsEmail,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  roleIds?: string[];

  @IsUUID()
  @IsOptional()
  unitId?: string;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  roleIds?: string[];

  @IsUUID()
  @IsOptional()
  unitId?: string;
}
