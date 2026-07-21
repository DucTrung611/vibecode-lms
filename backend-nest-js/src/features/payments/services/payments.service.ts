import { Injectable, Logger } from '@nestjs/common';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { PaginatedResult } from '../../../shared/types/paginated-result.type';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePagination,
} from '../../../shared/utils/pagination.util';
import { CoursesService } from '../../courses/services/courses.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';
import { OrderRepository } from '../repositories/order.repository';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly coursesService: CoursesService,
  ) {}

  async createOrder(
    studentId: string,
    dto: CreateOrderDto,
  ): Promise<OrderEntity> {
    const courses = await Promise.all(
      dto.courseIds.map((courseId) => this.coursesService.findById(courseId)),
    );

    const items = courses.map((course) => ({
      courseId: course.id,
      price: course.price,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    const order = await this.orderRepository.create({
      studentId,
      totalAmount,
      items,
    });

    this.logger.log(`Order ${order.id} created for student ${studentId}`);
    return OrderEntity.fromPrisma(order);
  }

  async findMyOrders(
    studentId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<OrderEntity>> {
    const normalized = normalizePagination({
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });

    const { items, total } = await this.orderRepository.findByStudent(
      studentId,
      normalized.page,
      normalized.limit,
    );

    return {
      items: items.map((order) => OrderEntity.fromPrisma(order)),
      meta: { page: normalized.page, limit: normalized.limit, total },
    };
  }

  async pay(studentId: string, orderId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new ApiException(404, 'PAYMENT_002', 'Order not found');
    }
    if (order.studentId !== studentId) {
      throw new ApiException(
        403,
        'AUTH_003',
        'This order does not belong to you',
      );
    }
    if (order.status !== 'PENDING') {
      throw new ApiException(409, 'PAYMENT_003', 'Order is not payable');
    }

    const paid = await this.orderRepository.markPaid(orderId);
    this.logger.log(`Order ${orderId} paid by student ${studentId}`);
    return OrderEntity.fromPrisma(paid);
  }

  hasPaidOrderForCourse(studentId: string, courseId: string): Promise<boolean> {
    return this.orderRepository.hasPaidOrderForCourse(studentId, courseId);
  }
}
