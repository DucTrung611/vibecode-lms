import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateOrderItemData {
  courseId: string;
  price: number;
}

export interface CreateOrderData {
  studentId: string;
  totalAmount: number;
  items: CreateOrderItemData[];
}

const ORDER_DETAIL_INCLUDE = {
  items: { include: { course: true } },
} as const;

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOrderData) {
    return this.prisma.order.create({
      data: {
        studentId: data.studentId,
        totalAmount: data.totalAmount,
        items: { create: data.items },
      },
      include: ORDER_DETAIL_INCLUDE,
    });
  }

  findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: ORDER_DETAIL_INCLUDE,
    });
  }

  async findByStudent(studentId: string, page: number, limit: number) {
    const where = { studentId };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: ORDER_DETAIL_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total };
  }

  markPaid(id: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
      include: ORDER_DETAIL_INCLUDE,
    });
  }

  async hasPaidOrderForCourse(
    studentId: string,
    courseId: string,
  ): Promise<boolean> {
    const count = await this.prisma.orderItem.count({
      where: { courseId, order: { studentId, status: 'PAID' } },
    });
    return count > 0;
  }
}
