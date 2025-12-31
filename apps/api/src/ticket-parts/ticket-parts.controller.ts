import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketPartsService } from './ticket-parts.service';
import { CreateTicketPartDto, UserRole } from '@fix-tracking-pro/interfaces';
import { Roles } from '../auth/guards/roles.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('ticket-parts')
export class TicketPartsController {
  constructor(private readonly ticketPartsService: TicketPartsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.TECHNICIAN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTicketPartDto: CreateTicketPartDto) {
    return this.ticketPartsService.create(createTicketPartDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.TECHNICIAN)
  @Get()
  findAll() {
    return this.ticketPartsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.TECHNICIAN, UserRole.CUSTOMER)
  @Get('ticket/:ticketId')
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.ticketPartsService.findByTicket(ticketId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.TECHNICIAN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketPartsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.TECHNICIAN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.ticketPartsService.remove(id);
  }
}

