import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from '../customers/customers.module';
import { DevicesModule } from '../devices/devices.module';
import { TicketsModule } from '../tickets/tickets.module';
import { PartsModule } from '../parts/parts.module';
import { TicketPartsModule } from '../ticket-parts/ticket-parts.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    CustomersModule,
    DevicesModule,
    TicketsModule,
    PartsModule,
    TicketPartsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
