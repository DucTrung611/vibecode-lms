import { Notification } from '@prisma/client';

export class NotificationEntity {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;

  static fromPrisma(notification: Notification): NotificationEntity {
    const entity = new NotificationEntity();
    entity.id = notification.id;
    entity.userId = notification.userId;
    entity.type = notification.type;
    entity.title = notification.title;
    entity.content = notification.content;
    entity.isRead = notification.isRead;
    entity.createdAt = notification.createdAt;
    return entity;
  }
}
