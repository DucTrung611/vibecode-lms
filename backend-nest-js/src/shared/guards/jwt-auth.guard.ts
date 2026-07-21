import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiException } from '../types/api-error-code.type';
import { RequestUser } from '../types/request-user.type';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = RequestUser>(
    err: unknown,
    user: TUser | false,
    info: { name?: string } | undefined,
  ): TUser {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new ApiException(401, 'AUTH_002', 'Access token expired');
      }
      throw new ApiException(
        401,
        'AUTH_001',
        'Missing or invalid access token',
      );
    }
    return user;
  }
}
