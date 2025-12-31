import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketPartDto } from '@fix-tracking-pro/interfaces';

@Injectable()
export class TicketPartsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketPartDto: CreateTicketPartDto) {
    // Use Prisma transaction to ensure data integrity
    return this.prisma.$transaction(async (tx: any) => {
      // Step 1: Check if Ticket exists
      const ticket = await tx.ticket.findUnique({
        where: { id: createTicketPartDto.ticketId },
      });

      if (!ticket) {
        throw new NotFoundException(
          `Ticket with ID ${createTicketPartDto.ticketId} not found`,
        );
      }

      // Step 2: Check if Part exists and has enough stock
      const part = await tx.part.findUnique({
        where: { id: createTicketPartDto.partId },
      });

      if (!part) {
        throw new NotFoundException(
          `Part with ID ${createTicketPartDto.partId} not found`,
        );
      }

      // Check if sufficient stock is available
      if (part.stockQuantity < createTicketPartDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${part.stockQuantity}, Requested: ${createTicketPartDto.quantity}`,
        );
      }

      // Step 3: Decrement the stockQuantity of the Part
      await tx.part.update({
        where: { id: createTicketPartDto.partId },
        data: {
          stockQuantity: {
            decrement: createTicketPartDto.quantity,
          },
        },
      });

      // Step 4: Create the TicketPart record linking Ticket and Part
      // Check if this part is already assigned to this ticket
      const existingTicketPart = await tx.ticketPart.findUnique({
        where: {
          ticketId_partId: {
            ticketId: createTicketPartDto.ticketId,
            partId: createTicketPartDto.partId,
          },
        },
      });

      if (existingTicketPart) {
        // If already exists, update the quantity instead
        return tx.ticketPart.update({
          where: { id: existingTicketPart.id },
          data: {
            quantity: existingTicketPart.quantity + createTicketPartDto.quantity,
          },
          include: {
            ticket: {
              select: {
                id: true,
                issueDescription: true,
                status: true,
              },
            },
            part: {
              select: {
                id: true,
                name: true,
                sku: true,
                stockQuantity: true,
                price: true,
              },
            },
          },
        });
      }

      // Create new TicketPart record
      return tx.ticketPart.create({
        data: {
          ticketId: createTicketPartDto.ticketId,
          partId: createTicketPartDto.partId,
          quantity: createTicketPartDto.quantity,
        },
        include: {
          ticket: {
            select: {
              id: true,
              issueDescription: true,
              status: true,
            },
          },
          part: {
            select: {
              id: true,
              name: true,
              sku: true,
              stockQuantity: true,
              price: true,
            },
          },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.ticketPart.findMany({
      include: {
        ticket: {
          select: {
            id: true,
            issueDescription: true,
            status: true,
          },
        },
        part: {
          select: {
            id: true,
            name: true,
            sku: true,
            stockQuantity: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByTicket(ticketId: string) {
    // Verify ticket exists
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    return this.prisma.ticketPart.findMany({
      where: { ticketId },
      include: {
        part: {
          select: {
            id: true,
            name: true,
            sku: true,
            stockQuantity: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const ticketPart = await this.prisma.ticketPart.findUnique({
      where: { id },
      include: {
        ticket: {
          select: {
            id: true,
            issueDescription: true,
            status: true,
          },
        },
        part: {
          select: {
            id: true,
            name: true,
            sku: true,
            stockQuantity: true,
            price: true,
          },
        },
      },
    });

    if (!ticketPart) {
      throw new NotFoundException(`TicketPart with ID ${id} not found`);
    }

    return ticketPart;
  }

  async remove(id: string) {
    // Check if TicketPart exists
    const ticketPart = await this.prisma.ticketPart.findUnique({
      where: { id },
    });

    if (!ticketPart) {
      throw new NotFoundException(`TicketPart with ID ${id} not found`);
    }

    // Use transaction to restore stock when removing TicketPart
    return this.prisma.$transaction(async (tx: any) => {
      // Restore the stock quantity
      await tx.part.update({
        where: { id: ticketPart.partId },
        data: {
          stockQuantity: {
            increment: ticketPart.quantity,
          },
        },
      });

      // Delete the TicketPart record
      return tx.ticketPart.delete({
        where: { id },
      });
    });
  }
}

