import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from '../../config/configuration';
import { RequestUser } from '../types/request-user.type';

interface WsJwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Not a CanActivate `@UseGuards`-style guard: socket.io lifecycle hooks
 * (`handleConnection`) run before Nest's guard pipeline applies, so WS auth
 * is a plain verify-and-disconnect call made manually from the gateway.
 */
@Injectable()
export class WsAuthGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  verifyToken(token: string): RequestUser {
    const payload = this.jwtService.verify<WsJwtPayload>(token, {
      secret: this.configService.get('jwt', { infer: true }).accessSecret,
    });
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
