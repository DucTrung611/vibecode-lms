import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { OrdersController } from './controllers/orders.controller';
import { OrderRepository } from './repositories/order.repository';
import { PaymentsService } from './services/payments.service';

@Module({
  imports: [CoursesModule],
  controllers: [OrdersController],
  providers: [PaymentsService, OrderRepository],
  exports: [PaymentsService],
})
export class PaymentsModule {}
