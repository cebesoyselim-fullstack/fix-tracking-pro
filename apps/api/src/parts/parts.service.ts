import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartDto, UpdatePartDto } from '@fix-tracking-pro/interfaces';

@Injectable()
export class PartsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPartDto: CreatePartDto) {
    // If SKU is provided, check for uniqueness
    if (createPartDto.sku) {
      const existingPart = await this.prisma.part.findUnique({
        where: { sku: createPartDto.sku },
      });

      if (existingPart) {
        throw new BadRequestException(
          `Part with SKU ${createPartDto.sku} already exists`,
        );
      }
    }

    return this.prisma.part.create({
      data: {
        name: createPartDto.name,
        sku: createPartDto.sku,
        stockQuantity: createPartDto.stockQuantity,
        price: createPartDto.price,
        cost: createPartDto.cost,
      },
    });
  }

  async findAll() {
    return this.prisma.part.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return part;
  }

  async update(id: string, updatePartDto: UpdatePartDto) {
    // Check if part exists
    const existingPart = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!existingPart) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    // If SKU is being updated, check for duplicates
    if (updatePartDto.sku && updatePartDto.sku !== existingPart.sku) {
      const duplicatePart = await this.prisma.part.findUnique({
        where: { sku: updatePartDto.sku },
      });

      if (duplicatePart) {
        throw new BadRequestException(
          `Part with SKU ${updatePartDto.sku} already exists`,
        );
      }
    }

    const updateData: {
      name?: string;
      sku?: string | null;
      stockQuantity?: number;
      price?: number;
      cost?: number;
    } = {};

    if (updatePartDto.name !== undefined) updateData.name = updatePartDto.name;
    if (updatePartDto.sku !== undefined) {
      // Allow setting SKU to null by passing empty string or null
      updateData.sku = updatePartDto.sku || null;
    }
    if (updatePartDto.stockQuantity !== undefined)
      updateData.stockQuantity = updatePartDto.stockQuantity;
    if (updatePartDto.price !== undefined) updateData.price = updatePartDto.price;
    if (updatePartDto.cost !== undefined) updateData.cost = updatePartDto.cost;

    return this.prisma.part.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    // Check if part exists
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return this.prisma.part.delete({
      where: { id },
    });
  }
}

