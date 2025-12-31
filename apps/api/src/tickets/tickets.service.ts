import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  TicketStatus,
  TicketPriority,
} from '@fix-tracking-pro/interfaces';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto) {
    // Verify device exists
    const device = await this.prisma.device.findUnique({
      where: { id: createTicketDto.deviceId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!device) {
      throw new NotFoundException(
        `Device with ID ${createTicketDto.deviceId} not found`,
      );
    }

    // Parse dueDate if provided
    const dueDate = createTicketDto.dueDate
      ? new Date(createTicketDto.dueDate)
      : null;

    return this.prisma.ticket.create({
      data: {
        deviceId: createTicketDto.deviceId,
        issueDescription: createTicketDto.issueDescription,
        status: createTicketDto.status || TicketStatus.OPEN,
        priority: createTicketDto.priority || TicketPriority.MEDIUM,
        estimatedCost: createTicketDto.estimatedCost,
        dueDate: dueDate,
      },
      include: {
        device: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            assignee: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.ticket.findMany({
      include: {
        device: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            assignee: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        device: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            assignee: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    // Check if ticket exists
    const existingTicket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // If deviceId is being updated, verify the new device exists
    if (updateTicketDto.deviceId) {
      const device = await this.prisma.device.findUnique({
        where: { id: updateTicketDto.deviceId },
      });

      if (!device) {
        throw new NotFoundException(
          `Device with ID ${updateTicketDto.deviceId} not found`,
        );
      }
    }

    // Validate enum values if provided
    if (updateTicketDto.status) {
      const validStatuses = Object.values(TicketStatus);
      if (!validStatuses.includes(updateTicketDto.status)) {
        throw new BadRequestException(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        );
      }
    }

    if (updateTicketDto.priority) {
      const validPriorities = Object.values(TicketPriority);
      if (!validPriorities.includes(updateTicketDto.priority)) {
        throw new BadRequestException(
          `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        );
      }
    }

    const updateData: {
      deviceId?: string;
      issueDescription?: string;
      status?: string;
      priority?: string;
      estimatedCost?: number;
      dueDate?: Date | null;
    } = {};

    if (updateTicketDto.deviceId) updateData.deviceId = updateTicketDto.deviceId;
    if (updateTicketDto.issueDescription)
      updateData.issueDescription = updateTicketDto.issueDescription;
    if (updateTicketDto.status) updateData.status = updateTicketDto.status;
    if (updateTicketDto.priority) updateData.priority = updateTicketDto.priority;
    if (updateTicketDto.estimatedCost !== undefined)
      updateData.estimatedCost = updateTicketDto.estimatedCost;
    if (updateTicketDto.dueDate !== undefined) {
      updateData.dueDate = updateTicketDto.dueDate
        ? new Date(updateTicketDto.dueDate)
        : null;
    }

    return this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        device: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            assignee: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if ticket exists
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return this.prisma.ticket.delete({
      where: { id },
      include: {
        device: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }
}

