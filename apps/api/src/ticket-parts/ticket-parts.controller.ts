import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TicketPartsService } from './ticket-parts.service';
import { CreateTicketPartDto } from '@fix-tracking-pro/interfaces';

@Controller('ticket-parts')
export class TicketPartsController {
  constructor(private readonly ticketPartsService: TicketPartsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTicketPartDto: CreateTicketPartDto) {
    return this.ticketPartsService.create(createTicketPartDto);
  }

  @Get()
  findAll() {
    return this.ticketPartsService.findAll();
  }

  @Get('ticket/:ticketId')
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.ticketPartsService.findByTicket(ticketId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketPartsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.ticketPartsService.remove(id);
  }
}

