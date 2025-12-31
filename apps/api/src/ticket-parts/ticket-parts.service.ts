import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketPartDto } from '@fix-tracking-pro/interfaces';
import { Prisma } from '@prisma/client';

type PrismaTransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class TicketPartsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketPartDto: CreateTicketPartDto) {
    // Use Prisma transaction to ensure data integrity
    return this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
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

      // Step 4: Check if this part is already assigned to this ticket
      const existingTicketPart = await tx.ticketPart.findUnique({
        where: {
          ticketId_partId: {
            ticketId: createTicketPartDto.ticketId,
            partId: createTicketPartDto.partId,
          },
        },
      });

      if (existingTicketPart) {
        // If already exists, we need to check if there's enough stock for the additional quantity
        // The current stock already accounts for the existing ticketPart.quantity
        // So we need: currentStock >= newQuantity (not existingQuantity + newQuantity)
        if (part.stockQuantity < createTicketPartDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${part.stockQuantity}, Requested: ${createTicketPartDto.quantity}`,
          );
        }

        // Decrement stock for the additional quantity
        await tx.part.update({
          where: { id: createTicketPartDto.partId },
          data: {
            stockQuantity: {
              decrement: createTicketPartDto.quantity,
            },
          },
        });

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

      // Step 5: Check if sufficient stock is available for new TicketPart
      if (part.stockQuantity < createTicketPartDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${part.stockQuantity}, Requested: ${createTicketPartDto.quantity}`,
        );
      }

      // Step 6: Decrement the stockQuantity of the Part
      await tx.part.update({
        where: { id: createTicketPartDto.partId },
        data: {
          stockQuantity: {
            decrement: createTicketPartDto.quantity,
          },
        },
      });

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
    return this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
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

