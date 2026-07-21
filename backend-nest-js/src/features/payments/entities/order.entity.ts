import { Course, Order, OrderItem } from '@prisma/client';
import { OrderItemEntity } from './order-item.entity';

export class OrderEntity {
  id: string;
  studentId: string;
  totalAmount: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  items?: OrderItemEntity[];

  static fromPrisma(
    order: Order & { items?: (OrderItem & { course?: Course })[] },
  ): OrderEntity {
    const entity = new OrderEntity();
    entity.id = order.id;
    entity.studentId = order.studentId;
    entity.totalAmount = Number(order.totalAmount);
    entity.status = order.status;
    entity.paidAt = order.paidAt;
    entity.createdAt = order.createdAt;
    if (order.items) {
      entity.items = order.items.map((item) =>
        OrderItemEntity.fromPrisma(item),
      );
    }
    return entity;
  }
}
