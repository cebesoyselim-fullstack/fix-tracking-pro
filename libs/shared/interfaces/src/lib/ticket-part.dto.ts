import { IsString, IsInt, Min } from 'class-validator';

export class CreateTicketPartDto {
  @IsString()
  ticketId!: string; // Links to Ticket

  @IsString()
  partId!: string; // Links to Part

  @IsInt()
  @Min(1) // Quantity must be greater than 0
  quantity!: number; // Integer > 0
}

