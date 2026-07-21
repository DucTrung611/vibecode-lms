import { NotificationsController } from '../controllers/notifications.controller';
import { NotificationsService } from '../services/notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: jest.Mocked<
    Pick<NotificationsService, 'findMyNotifications' | 'markAsRead'>
  >;

  beforeEach(() => {
    notificationsService = {
      findMyNotifications: jest.fn(),
      markAsRead: jest.fn(),
    };
    controller = new NotificationsController(
      notificationsService as unknown as NotificationsService,
    );
  });

  describe('findMine', () => {
    it('delegates to notificationsService.findMyNotifications with the current user and query', async () => {
      notificationsService.findMyNotifications.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await controller.findMine('user_1', {
        page: 2,
        limit: 5,
      });

      expect(notificationsService.findMyNotifications).toHaveBeenCalledWith(
        'user_1',
        2,
        5,
      );
      expect(result).toEqual({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });
    });
  });

  describe('markAsRead', () => {
    it('delegates to notificationsService.markAsRead with the current user and notification id', async () => {
      notificationsService.markAsRead.mockResolvedValue({
        id: 'notif_1',
        isRead: true,
      } as never);

      const result = await controller.markAsRead('user_1', 'notif_1');

      expect(notificationsService.markAsRead).toHaveBeenCalledWith(
        'user_1',
        'notif_1',
      );
      expect(result).toEqual({ id: 'notif_1', isRead: true });
    });
  });
});
