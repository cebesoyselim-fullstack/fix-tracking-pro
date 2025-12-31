import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, UserRole } from '@fix-tracking-pro/interfaces';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createCustomerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${createCustomerDto.email} already exists`,
      );
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createCustomerDto.email,
        password: hashedPassword,
        role: UserRole.CUSTOMER,
      },
      // Exclude password from response
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.user.findFirst({
      where: {
        id,
        role: UserRole.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    // Check if customer exists
    await this.findOne(id);

    // If email is being updated, check for duplicates
    if (updateCustomerDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateCustomerDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          `User with email ${updateCustomerDto.email} already exists`,
        );
      }
    }

    const updateData: { email?: string; password?: string } = {};

    if (updateCustomerDto.email) {
      updateData.email = updateCustomerDto.email;
    }

    if (updateCustomerDto.password) {
      // Hash new password
      updateData.password = await bcrypt.hash(updateCustomerDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    // Check if customer exists
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

