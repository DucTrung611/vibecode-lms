import { Order } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { OrderRepository } from '../repositories/order.repository';

describe('OrderRepository', () => {
  let repository: OrderRepository;
  let prisma: {
    order: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    orderItem: {
      count: jest.Mock;
    };
  };

  const fakeOrder = { id: 'order_1' } as Order;
  const detailInclude = { items: { include: { course: true } } };

  beforeEach(() => {
    prisma = {
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      orderItem: {
        count: jest.fn(),
      },
    };
    repository = new OrderRepository(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('creates the order with nested order items and includes course detail', async () => {
      prisma.order.create.mockResolvedValue(fakeOrder);

      const result = await repository.create({
        studentId: 'student_1',
        totalAmount: 99.98,
        items: [{ courseId: 'course_1', price: 49.99 }],
      });

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          studentId: 'student_1',
          totalAmount: 99.98,
          items: { create: [{ courseId: 'course_1', price: 49.99 }] },
        },
        include: detailInclude,
      });
      expect(result).toBe(fakeOrder);
    });
  });

  describe('findById', () => {
    it('queries by id including items and course', async () => {
      prisma.order.findUnique.mockResolvedValue(fakeOrder);

      const result = await repository.findById('order_1');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order_1' },
        include: detailInclude,
      });
      expect(result).toBe(fakeOrder);
    });
  });

  describe('findByStudent', () => {
    it('paginates and includes items, ordered by most recent', async () => {
      prisma.order.findMany.mockResolvedValue([fakeOrder]);
      prisma.order.count.mockResolvedValue(1);

      const result = await repository.findByStudent('student_1', 2, 10);

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student_1' },
        include: detailInclude,
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(result).toEqual({ items: [fakeOrder], total: 1 });
    });
  });

  describe('markPaid', () => {
    it('sets status to PAID and stamps paidAt', async () => {
      prisma.order.update.mockResolvedValue(fakeOrder);

      const result = await repository.markPaid('order_1');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order_1' },
        data: { status: 'PAID', paidAt: expect.any(Date) as Date },
        include: detailInclude,
      });
      expect(result).toBe(fakeOrder);
    });
  });

  describe('hasPaidOrderForCourse', () => {
    it('returns true when a paid order item exists for the course', async () => {
      prisma.orderItem.count.mockResolvedValue(1);

      const result = await repository.hasPaidOrderForCourse(
        'student_1',
        'course_1',
      );

      expect(prisma.orderItem.count).toHaveBeenCalledWith({
        where: {
          courseId: 'course_1',
          order: { studentId: 'student_1', status: 'PAID' },
        },
      });
      expect(result).toBe(true);
    });

    it('returns false when no paid order item exists', async () => {
      prisma.orderItem.count.mockResolvedValue(0);

      const result = await repository.hasPaidOrderForCourse(
        'student_1',
        'course_1',
      );

      expect(result).toBe(false);
    });
  });
});
