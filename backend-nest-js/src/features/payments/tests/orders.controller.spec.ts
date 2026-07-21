import { OrdersController } from '../controllers/orders.controller';
import { PaymentsService } from '../services/payments.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let paymentsService: jest.Mocked<
    Pick<PaymentsService, 'createOrder' | 'findMyOrders' | 'pay'>
  >;

  beforeEach(() => {
    paymentsService = {
      createOrder: jest.fn(),
      findMyOrders: jest.fn(),
      pay: jest.fn(),
    };
    controller = new OrdersController(
      paymentsService as unknown as PaymentsService,
    );
  });

  describe('create', () => {
    it('delegates to paymentsService.createOrder with the current student and body', async () => {
      paymentsService.createOrder.mockResolvedValue({ id: 'order_1' } as never);

      const result = await controller.create('student_1', {
        courseIds: ['course_1'],
      });

      expect(paymentsService.createOrder).toHaveBeenCalledWith('student_1', {
        courseIds: ['course_1'],
      });
      expect(result).toEqual({ id: 'order_1' });
    });
  });

  describe('findMine', () => {
    it('delegates to paymentsService.findMyOrders with the current student and query', async () => {
      paymentsService.findMyOrders.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await controller.findMine('student_1', {
        page: 2,
        limit: 5,
      });

      expect(paymentsService.findMyOrders).toHaveBeenCalledWith(
        'student_1',
        2,
        5,
      );
      expect(result).toEqual({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });
    });
  });

  describe('pay', () => {
    it('delegates to paymentsService.pay with the current student and order id', async () => {
      paymentsService.pay.mockResolvedValue({
        id: 'order_1',
        status: 'PAID',
      } as never);

      const result = await controller.pay('student_1', 'order_1');

      expect(paymentsService.pay).toHaveBeenCalledWith('student_1', 'order_1');
      expect(result).toEqual({ id: 'order_1', status: 'PAID' });
    });
  });
});
