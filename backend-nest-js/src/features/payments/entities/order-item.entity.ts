import { Course, OrderItem } from '@prisma/client';

export class OrderItemEntity {
  id: string;
  orderId: string;
  courseId: string;
  price: number;
  course?: { id: string; title: string; thumbnailUrl: string | null };

  static fromPrisma(item: OrderItem & { course?: Course }): OrderItemEntity {
    const entity = new OrderItemEntity();
    entity.id = item.id;
    entity.orderId = item.orderId;
    entity.courseId = item.courseId;
    entity.price = Number(item.price);
    if (item.course) {
      entity.course = {
        id: item.course.id,
        title: item.course.title,
        thumbnailUrl: item.course.thumbnailUrl,
      };
    }
    return entity;
  }
}
