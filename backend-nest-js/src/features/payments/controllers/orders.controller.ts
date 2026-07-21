import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateOrderDto } from '../dto/create-order.dto';
import { QueryOrdersDto } from '../dto/query-orders.dto';
import { PaymentsService } from '../services/payments.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
export class OrdersController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@CurrentUser('id') studentId: string, @Body() dto: CreateOrderDto) {
    return this.paymentsService.createOrder(studentId, dto);
  }

  @Get('me')
  findMine(
    @CurrentUser('id') studentId: string,
    @Query() query: QueryOrdersDto,
  ) {
    return this.paymentsService.findMyOrders(
      studentId,
      query.page,
      query.limit,
    );
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  pay(@CurrentUser('id') studentId: string, @Param('id') orderId: string) {
    return this.paymentsService.pay(studentId, orderId);
  }
}
