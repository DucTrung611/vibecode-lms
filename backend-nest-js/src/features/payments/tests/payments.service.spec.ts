import { Order } from '@prisma/client';
import { CoursesService } from '../../courses/services/courses.service';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { OrderRepository } from '../repositories/order.repository';
import { PaymentsService } from '../services/payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let orderRepository: jest.Mocked<
    Pick<
      OrderRepository,
      | 'create'
      | 'findById'
      | 'findByStudent'
      | 'markPaid'
      | 'hasPaidOrderForCourse'
    >
  >;
  let coursesService: jest.Mocked<Pick<CoursesService, 'findById'>>;

  const fakeOrder = {
    id: 'order_1',
    studentId: 'student_1',
    totalAmount: 99.98 as unknown as Order['totalAmount'],
    status: 'PENDING',
    paidAt: null,
    createdAt: new Date('2026-01-01'),
    items: [
      { id: 'item_1', orderId: 'order_1', courseId: 'course_1', price: 49.99 },
      { id: 'item_2', orderId: 'order_1', courseId: 'course_2', price: 49.99 },
    ],
  };

  beforeEach(() => {
    orderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByStudent: jest.fn(),
      markPaid: jest.fn(),
      hasPaidOrderForCourse: jest.fn(),
    };
    coursesService = {
      findById: jest.fn(),
    };

    service = new PaymentsService(
      orderRepository as unknown as OrderRepository,
      coursesService as unknown as CoursesService,
    );
  });

  describe('createOrder', () => {
    it('fetches each course, sums live prices, and creates the order', async () => {
      coursesService.findById
        .mockResolvedValueOnce({ id: 'course_1', price: 49.99 } as never)
        .mockResolvedValueOnce({ id: 'course_2', price: 29.99 } as never);
      orderRepository.create.mockResolvedValue(fakeOrder as never);

      const result = await service.createOrder('student_1', {
        courseIds: ['course_1', 'course_2'],
      });

      expect(orderRepository.create).toHaveBeenCalledWith({
        studentId: 'student_1',
        totalAmount: 79.98,
        items: [
          { courseId: 'course_1', price: 49.99 },
          { courseId: 'course_2', price: 29.99 },
        ],
      });
      expect(result.id).toBe('order_1');
    });

    it('propagates COURSE_004 when a course does not exist', async () => {
      coursesService.findById.mockRejectedValue(
        new ApiException(404, 'COURSE_004', 'Course not found'),
      );

      await expect(
        service.createOrder('student_1', { courseIds: ['missing'] }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_004' });
      expect(orderRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findMyOrders', () => {
    it('normalizes pagination defaults and maps results', async () => {
      orderRepository.findByStudent.mockResolvedValue({
        items: [fakeOrder],
        total: 1,
      } as never);

      const result = await service.findMyOrders('student_1');

      expect(orderRepository.findByStudent).toHaveBeenCalledWith(
        'student_1',
        1,
        20,
      );
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0].id).toBe('order_1');
    });
  });

  describe('pay', () => {
    it('throws PAYMENT_002 (404) when the order does not exist', async () => {
      orderRepository.findById.mockResolvedValue(null);

      await expect(service.pay('student_1', 'missing')).rejects.toMatchObject({
        httpStatus: 404,
        code: 'PAYMENT_002',
      });
    });

    it('throws AUTH_003 (403) when the order belongs to another student', async () => {
      orderRepository.findById.mockResolvedValue(fakeOrder as never);

      await expect(
        service.pay('someone_else', 'order_1'),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('throws PAYMENT_003 (409) when the order is not PENDING', async () => {
      orderRepository.findById.mockResolvedValue({
        ...fakeOrder,
        status: 'PAID',
      } as never);

      await expect(service.pay('student_1', 'order_1')).rejects.toMatchObject({
        httpStatus: 409,
        code: 'PAYMENT_003',
      });
    });

    it('marks the order paid and returns it', async () => {
      orderRepository.findById.mockResolvedValue(fakeOrder as never);
      orderRepository.markPaid.mockResolvedValue({
        ...fakeOrder,
        status: 'PAID',
        paidAt: new Date(),
      } as never);

      const result = await service.pay('student_1', 'order_1');

      expect(orderRepository.markPaid).toHaveBeenCalledWith('order_1');
      expect(result.status).toBe('PAID');
    });
  });

  describe('hasPaidOrderForCourse', () => {
    it('delegates to the repository', async () => {
      orderRepository.hasPaidOrderForCourse.mockResolvedValue(true);

      const result = await service.hasPaidOrderForCourse(
        'student_1',
        'course_1',
      );

      expect(orderRepository.hasPaidOrderForCourse).toHaveBeenCalledWith(
        'student_1',
        'course_1',
      );
      expect(result).toBe(true);
    });
  });
});
