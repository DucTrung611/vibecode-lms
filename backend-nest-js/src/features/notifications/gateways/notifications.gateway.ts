import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from '../../../shared/guards/ws-auth.guard';
import { NotificationEntity } from '../entities/notification.entity';

interface SocketData {
  userId?: string;
}

@Injectable()
@WebSocketGateway({ namespace: '/realtime', cors: true })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly socketIdsByUser = new Map<string, Set<string>>();

  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly wsAuthGuard: WsAuthGuard) {}

  handleConnection(client: Socket): void {
    const token = client.handshake.query.token;
    if (typeof token !== 'string') {
      client.disconnect();
      return;
    }

    try {
      const user = this.wsAuthGuard.verifyToken(token);
      (client.data as SocketData).userId = user.id;
      this.addSocket(user.id, client.id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = (client.data as SocketData).userId;
    if (userId) {
      this.removeSocket(userId, client.id);
    }
  }

  emitNewNotification(userId: string, notification: NotificationEntity): void {
    const socketIds = this.socketIdsByUser.get(userId);
    if (!socketIds || socketIds.size === 0) {
      return;
    }
    for (const socketId of socketIds) {
      this.server.to(socketId).emit('notification.new', notification);
    }
    this.logger.log(`Pushed notification.new to user ${userId}`);
  }

  private addSocket(userId: string, socketId: string): void {
    const sockets = this.socketIdsByUser.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.socketIdsByUser.set(userId, sockets);
  }

  private removeSocket(userId: string, socketId: string): void {
    const sockets = this.socketIdsByUser.get(userId);
    if (!sockets) {
      return;
    }
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.socketIdsByUser.delete(userId);
    }
  }
}
