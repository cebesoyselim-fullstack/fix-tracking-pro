import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';

export enum UserRole {
  MANAGER = 'MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  CUSTOMER = 'CUSTOMER',
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  role!: UserRole; // MANAGER or TECHNICIAN for staff
}

