import { Injectable, Logger } from '@nestjs/common';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { PaginatedResult } from '../../../shared/types/paginated-result.type';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePagination,
} from '../../../shared/utils/pagination.util';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findMyNotifications(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<NotificationEntity>> {
    const normalized = normalizePagination({
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });

    const { items, total } = await this.notificationRepository.findByUser(
      userId,
      normalized.page,
      normalized.limit,
    );

    return {
      items: items.map((notification) =>
        NotificationEntity.fromPrisma(notification),
      ),
      meta: { page: normalized.page, limit: normalized.limit, total },
    };
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationEntity> {
    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new ApiException(404, 'NOTIFICATION_001', 'Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ApiException(
        403,
        'AUTH_003',
        'This notification does not belong to you',
      );
    }

    const updated =
      await this.notificationRepository.markAsRead(notificationId);
    return NotificationEntity.fromPrisma(updated);
  }

  async notify(
    userId: string,
    type: string,
    title: string,
    content: string,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.create({
      userId,
      type,
      title,
      content,
    });
    const entity = NotificationEntity.fromPrisma(notification);

    this.notificationsGateway.emitNewNotification(userId, entity);
    this.logger.log(`Notified user ${userId}: ${title}`);

    return entity;
  }
}
