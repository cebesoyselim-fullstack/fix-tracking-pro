import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from '../customers/customers.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [CustomersModule, DevicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
