import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTicketDto {
  @IsUUID()
  deviceId!: string; // Links ticket to device

  @IsString()
  issueDescription!: string;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus; // Defaults to OPEN

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority; // Defaults to MEDIUM

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedCost?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string; // ISO date string
}

export class UpdateTicketDto {
  @IsUUID()
  @IsOptional()
  deviceId?: string; // Can transfer to different device

  @IsString()
  @IsOptional()
  issueDescription?: string;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedCost?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string; // ISO date string
}

