import { Notification } from '@prisma/client';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationsService } from '../services/notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: jest.Mocked<
    Pick<
      NotificationRepository,
      'findById' | 'findByUser' | 'create' | 'markAsRead'
    >
  >;
  let notificationsGateway: jest.Mocked<
    Pick<NotificationsGateway, 'emitNewNotification'>
  >;

  const fakeNotification: Notification = {
    id: 'notif_1',
    userId: 'user_1',
    type: 'ENROLLMENT_COMPLETED',
    title: 'Course completed',
    content: 'You finished the course!',
    isRead: false,
    createdAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    notificationRepository = {
      findById: jest.fn(),
      findByUser: jest.fn(),
      create: jest.fn(),
      markAsRead: jest.fn(),
    };
    notificationsGateway = { emitNewNotification: jest.fn() };

    service = new NotificationsService(
      notificationRepository as unknown as NotificationRepository,
      notificationsGateway as unknown as NotificationsGateway,
    );
  });

  describe('findMyNotifications', () => {
    it('normalizes pagination defaults and maps results', async () => {
      notificationRepository.findByUser.mockResolvedValue({
        items: [fakeNotification],
        total: 1,
      });

      const result = await service.findMyNotifications('user_1');

      expect(notificationRepository.findByUser).toHaveBeenCalledWith(
        'user_1',
        1,
        20,
      );
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0].id).toBe('notif_1');
    });
  });

  describe('markAsRead', () => {
    it('throws NOTIFICATION_001 (404) when the notification does not exist', async () => {
      notificationRepository.findById.mockResolvedValue(null);

      await expect(
        service.markAsRead('user_1', 'missing'),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'NOTIFICATION_001' });
    });

    it('throws AUTH_003 (403) when the notification belongs to another user', async () => {
      notificationRepository.findById.mockResolvedValue(fakeNotification);

      await expect(
        service.markAsRead('someone_else', 'notif_1'),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('marks the notification as read', async () => {
      notificationRepository.findById.mockResolvedValue(fakeNotification);
      notificationRepository.markAsRead.mockResolvedValue({
        ...fakeNotification,
        isRead: true,
      });

      const result = await service.markAsRead('user_1', 'notif_1');

      expect(notificationRepository.markAsRead).toHaveBeenCalledWith('notif_1');
      expect(result.isRead).toBe(true);
    });
  });

  describe('notify', () => {
    it('creates the notification and pushes it over the gateway', async () => {
      notificationRepository.create.mockResolvedValue(fakeNotification);

      const result = await service.notify(
        'user_1',
        'ENROLLMENT_COMPLETED',
        'Course completed',
        'You finished the course!',
      );

      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: 'user_1',
        type: 'ENROLLMENT_COMPLETED',
        title: 'Course completed',
        content: 'You finished the course!',
      });
      expect(notificationsGateway.emitNewNotification).toHaveBeenCalledWith(
        'user_1',
        expect.objectContaining({ id: 'notif_1' }),
      );
      expect(result.id).toBe('notif_1');
    });
  });
});
