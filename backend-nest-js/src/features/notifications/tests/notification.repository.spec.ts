import { Notification } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { NotificationRepository } from '../repositories/notification.repository';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let prisma: {
    notification: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const fakeNotification = { id: 'notif_1' } as Notification;

  beforeEach(() => {
    prisma = {
      notification: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new NotificationRepository(prisma as unknown as PrismaService);
  });

  describe('findById', () => {
    it('queries by id', async () => {
      prisma.notification.findUnique.mockResolvedValue(fakeNotification);

      const result = await repository.findById('notif_1');

      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: 'notif_1' },
      });
      expect(result).toBe(fakeNotification);
    });
  });

  describe('findByUser', () => {
    it('paginates, ordered by most recent', async () => {
      prisma.notification.findMany.mockResolvedValue([fakeNotification]);
      prisma.notification.count.mockResolvedValue(1);

      const result = await repository.findByUser('user_1', 2, 10);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user_1' },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user_1' },
      });
      expect(result).toEqual({ items: [fakeNotification], total: 1 });
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.notification.create.mockResolvedValue(fakeNotification);
      const data = {
        userId: 'user_1',
        type: 'ENROLLMENT_COMPLETED',
        title: 'Course completed',
        content: 'You finished the course!',
      };

      const result = await repository.create(data);

      expect(prisma.notification.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeNotification);
    });
  });

  describe('markAsRead', () => {
    it('sets isRead to true', async () => {
      prisma.notification.update.mockResolvedValue(fakeNotification);

      const result = await repository.markAsRead('notif_1');

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif_1' },
        data: { isRead: true },
      });
      expect(result).toBe(fakeNotification);
    });
  });
});
