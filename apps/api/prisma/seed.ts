// Set DATABASE_URL before any imports
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

import { PrismaClient } from '../../../node_modules/.prisma/client/client';
import { Role, DeviceStatus } from '../../../node_modules/.prisma/client/enums';
import * as bcrypt from 'bcrypt';

// PrismaClient reads DATABASE_URL from process.env automatically
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for all users (using same password for simplicity in dev)
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@fixtracking.com' },
    update: {},
    create: {
      email: 'manager@fixtracking.com',
      password: hashedPassword,
      role: Role.MANAGER,
    },
  });
  console.log('✅ Created Manager:', manager.email);

  // Create Technician
  const technician = await prisma.user.upsert({
    where: { email: 'technician@fixtracking.com' },
    update: {},
    create: {
      email: 'technician@fixtracking.com',
      password: hashedPassword,
      role: Role.TECHNICIAN,
    },
  });
  console.log('✅ Created Technician:', technician.email);

  // Create Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@fixtracking.com' },
    update: {},
    create: {
      email: 'customer@fixtracking.com',
      password: hashedPassword,
      role: Role.CUSTOMER,
    },
  });
  console.log('✅ Created Customer:', customer.email);

  // Create Device 1 (assigned to technician)
  const device1 = await prisma.device.upsert({
    where: { serialNumber: 'DEV-001-2024' },
    update: {},
    create: {
      brand: 'Samsung',
      model: 'Galaxy S21',
      serialNumber: 'DEV-001-2024',
      status: DeviceStatus.IN_PROGRESS,
      price: 1500.0,
      ownerId: customer.id,
      assigneeId: technician.id,
    },
  });
  console.log('✅ Created Device 1:', device1.serialNumber);

  // Create Device 2 (not assigned yet)
  const device2 = await prisma.device.upsert({
    where: { serialNumber: 'DEV-002-2024' },
    update: {},
    create: {
      brand: 'Apple',
      model: 'iPhone 13',
      serialNumber: 'DEV-002-2024',
      status: DeviceStatus.PENDING,
      price: 0,
      ownerId: customer.id,
      assigneeId: null,
    },
  });
  console.log('✅ Created Device 2:', device2.serialNumber);

  // Create some device logs for Device 1
  await prisma.deviceLog.createMany({
    data: [
      {
        deviceId: device1.id,
        message: 'Device received and initial inspection completed',
      },
      {
        deviceId: device1.id,
        message: 'Diagnosis: Screen replacement needed',
      },
    ],
  });
  console.log('✅ Created device logs for Device 1');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

