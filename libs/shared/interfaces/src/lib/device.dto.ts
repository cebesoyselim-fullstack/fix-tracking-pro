import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
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

  @IsString()
  customerId!: string; // Links device to customer (owner) - uses cuid format
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

  @IsString()
  @IsOptional()
  customerId?: string; // Optional: can transfer ownership - uses cuid format
}

