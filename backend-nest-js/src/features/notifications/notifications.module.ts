import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from '../../config/configuration';
import { WsAuthGuard } from '../../shared/guards/ws-auth.guard';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        secret: configService.get('jwt', { infer: true }).accessSecret,
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    NotificationsGateway,
    WsAuthGuard,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
