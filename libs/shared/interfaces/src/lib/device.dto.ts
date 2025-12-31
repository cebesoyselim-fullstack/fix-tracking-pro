import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  Min,
} from 'class-validator';

export enum DeviceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
}

export class CreateDeviceDto {
  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsString()
  serialNumber!: string;

  @IsEnum(DeviceStatus)
  @IsOptional()
  status?: DeviceStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsUUID()
  customerId!: string; // Links device to customer (owner)
}

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsEnum(DeviceStatus)
  @IsOptional()
  status?: DeviceStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsUUID()
  @IsOptional()
  customerId?: string; // Optional: can transfer ownership
}

