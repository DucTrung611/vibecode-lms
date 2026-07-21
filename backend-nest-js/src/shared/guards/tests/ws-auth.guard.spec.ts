import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from '../../../config/configuration';
import { WsAuthGuard } from '../ws-auth.guard';

describe('WsAuthGuard', () => {
  let guard: WsAuthGuard;
  let jwtService: jest.Mocked<Pick<JwtService, 'verify'>>;
  let configService: jest.Mocked<Pick<ConfigService<AppConfig, true>, 'get'>>;

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    configService = {
      get: jest.fn().mockReturnValue({ accessSecret: 'test-secret' }),
    };

    guard = new WsAuthGuard(
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService<AppConfig, true>,
    );
  });

  describe('verifyToken', () => {
    it('verifies with the configured access secret and maps the payload to a RequestUser', () => {
      jwtService.verify.mockReturnValue({
        sub: 'user_1',
        email: 'user@example.com',
        role: 'STUDENT',
      });

      const result = guard.verifyToken('a.jwt.token');

      expect(jwtService.verify).toHaveBeenCalledWith('a.jwt.token', {
        secret: 'test-secret',
      });
      expect(result).toEqual({
        id: 'user_1',
        email: 'user@example.com',
        role: 'STUDENT',
      });
    });

    it('propagates the error when the token is invalid', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => guard.verifyToken('bad-token')).toThrow('invalid token');
    });
  });
});
