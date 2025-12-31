import { Module } from '@nestjs/common';
import { TicketPartsService } from './ticket-parts.service';
import { TicketPartsController } from './ticket-parts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TicketPartsController],
  providers: [TicketPartsService, PrismaService],
  exports: [TicketPartsService],
})
export class TicketPartsModule {}

