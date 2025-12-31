import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto, UpdateDeviceDto, DeviceStatus, UserRole } from '@fix-tracking-pro/interfaces';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto) {
    // Verify customer exists and is actually a CUSTOMER role
    const customer = await this.prisma.user.findFirst({
      where: {
        id: createDeviceDto.customerId,
        role: UserRole.CUSTOMER,
      },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${createDeviceDto.customerId} not found`,
      );
    }

    // Check if serial number already exists
    const existingDevice = await this.prisma.device.findUnique({
      where: { serialNumber: createDeviceDto.serialNumber },
    });

    if (existingDevice) {
      throw new BadRequestException(
        `Device with serial number ${createDeviceDto.serialNumber} already exists`,
      );
    }

    return this.prisma.device.create({
      data: {
        brand: createDeviceDto.brand,
        model: createDeviceDto.model,
        serialNumber: createDeviceDto.serialNumber,
        status: createDeviceDto.status || DeviceStatus.PENDING,
        price: createDeviceDto.price ?? 0,
        ownerId: createDeviceDto.customerId, // Link to customer
      },
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
    });
  }

  async findAll() {
    return this.prisma.device.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
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
        logs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return device;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    // Check if device exists
    const existingDevice = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!existingDevice) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    // If customerId is being updated, verify the new customer exists
    if (updateDeviceDto.customerId) {
      const customer = await this.prisma.user.findFirst({
        where: {
          id: updateDeviceDto.customerId,
          role: UserRole.CUSTOMER,
        },
      });

      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${updateDeviceDto.customerId} not found`,
        );
      }
    }

    // If serialNumber is being updated, check for duplicates
    if (updateDeviceDto.serialNumber && updateDeviceDto.serialNumber !== existingDevice.serialNumber) {
      const duplicateDevice = await this.prisma.device.findUnique({
        where: { serialNumber: updateDeviceDto.serialNumber },
      });

      if (duplicateDevice) {
        throw new BadRequestException(
          `Device with serial number ${updateDeviceDto.serialNumber} already exists`,
        );
      }
    }

    const updateData: {
      brand?: string;
      model?: string;
      serialNumber?: string;
      status?: string;
      price?: number;
      ownerId?: string;
    } = {};

    if (updateDeviceDto.brand) updateData.brand = updateDeviceDto.brand;
    if (updateDeviceDto.model) updateData.model = updateDeviceDto.model;
    if (updateDeviceDto.serialNumber) updateData.serialNumber = updateDeviceDto.serialNumber;
    if (updateDeviceDto.status) updateData.status = updateDeviceDto.status;
    if (updateDeviceDto.price !== undefined) updateData.price = updateDeviceDto.price;
    if (updateDeviceDto.customerId) updateData.ownerId = updateDeviceDto.customerId;

    return this.prisma.device.update({
      where: { id },
      data: updateData,
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
    });
  }

  async remove(id: string) {
    // Check if device exists
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return this.prisma.device.delete({
      where: { id },
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
  }
}

