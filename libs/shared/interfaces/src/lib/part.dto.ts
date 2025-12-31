import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

export class CreatePartDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  sku?: string; // Stock Keeping Unit - optional but unique if provided

  @IsInt()
  @Min(0)
  stockQuantity!: number; // Integer >= 0

  @IsNumber()
  @Min(0)
  price!: number; // Positive number

  @IsNumber()
  @Min(0)
  cost!: number; // Positive number
}

export class UpdatePartDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  sku?: string; // Stock Keeping Unit - optional but unique if provided

  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number; // Integer >= 0

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number; // Positive number

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number; // Positive number
}

