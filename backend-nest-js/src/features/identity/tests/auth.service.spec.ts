import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { AppConfig } from '../../../config/configuration';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import * as passwordUtil from '../utils/password.util';
import * as refreshTokenUtil from '../utils/refresh-token.util';

jest.mock('../utils/password.util');
jest.mock('../utils/refresh-token.util');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<
    Pick<UserRepository, 'findByEmail' | 'findById' | 'create'>
  >;
  let refreshTokenRepository: jest.Mocked<
    Pick<RefreshTokenRepository, 'create' | 'findActiveByHash' | 'revoke'>
  >;
  let jwtService: jest.Mocked<
    Pick<JwtService, 'signAsync' | 'verifyAsync' | 'decode'>
  >;
  let configService: jest.Mocked<Pick<ConfigService<AppConfig, true>, 'get'>>;

  const hashPassword = passwordUtil.hashPassword as jest.Mock;
  const comparePassword = passwordUtil.comparePassword as jest.Mock;
  const hashRefreshToken = refreshTokenUtil.hashRefreshToken as jest.Mock;

  const fakeUser: User = {
    id: 'user_1',
    email: 'a@b.com',
    password: 'hashed-pw',
    fullName: 'A B',
    avatarUrl: null,
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    refreshTokenRepository = {
      create: jest.fn(),
      findActiveByHash: jest.fn(),
      revoke: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    };
    configService = {
      get: jest.fn().mockReturnValue({
        accessSecret: 'access-secret',
        accessExpiresIn: '15m',
        refreshSecret: 'refresh-secret',
        refreshExpiresIn: '7d',
      }),
    };

    hashRefreshToken.mockImplementation((token: string) => `hash-of-${token}`);

    service = new AuthService(
      userRepository as unknown as UserRepository,
      refreshTokenRepository as unknown as RefreshTokenRepository,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService<AppConfig, true>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws AUTH_004 (409) when the email is already taken', async () => {
      userRepository.findByEmail.mockResolvedValue(fakeUser);

      await expect(
        service.register({
          email: 'a@b.com',
          password: 'password123',
          fullName: 'A B',
          role: 'STUDENT',
        }),
      ).rejects.toMatchObject({ httpStatus: 409, code: 'AUTH_004' });
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('hashes the password and creates the user', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      hashPassword.mockResolvedValue('hashed-pw');
      userRepository.create.mockResolvedValue(fakeUser);

      const result = await service.register({
        email: 'a@b.com',
        password: 'password123',
        fullName: 'A B',
        role: 'STUDENT',
      });

      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'hashed-pw',
        fullName: 'A B',
        role: 'STUDENT',
      });
      expect(result.id).toBe('user_1');
      expect(
        (result as unknown as { password?: string }).password,
      ).toBeUndefined();
    });
  });

  describe('login', () => {
    it('throws AUTH_005 (401) when the email is not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@b.com', password: 'password123' }),
      ).rejects.toMatchObject({ httpStatus: 401, code: 'AUTH_005' });
    });

    it('throws AUTH_005 (401) when the password does not match', async () => {
      userRepository.findByEmail.mockResolvedValue(fakeUser);
      comparePassword.mockResolvedValue(false);

      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toMatchObject({ httpStatus: 401, code: 'AUTH_005' });
    });

    it('issues a token pair and returns the user on success', async () => {
      userRepository.findByEmail.mockResolvedValue(fakeUser);
      comparePassword.mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      jwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      refreshTokenRepository.create.mockResolvedValue({
        id: 'rt_1',
      } as never);

      const result = await service.login({
        email: 'a@b.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.id).toBe('user_1');
      expect(refreshTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user_1',
          tokenHash: 'hash-of-refresh-token',
        }),
      );
    });
  });

  describe('refresh', () => {
    it('throws AUTH_002 (401) when the refresh token is expired', async () => {
      jwtService.verifyAsync.mockRejectedValue(
        Object.assign(new Error('expired'), { name: 'TokenExpiredError' }),
      );

      await expect(service.refresh('expired-token')).rejects.toMatchObject({
        httpStatus: 401,
        code: 'AUTH_002',
      });
    });

    it('throws AUTH_006 (401) when the token signature is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad signature'));

      await expect(service.refresh('bad-token')).rejects.toMatchObject({
        httpStatus: 401,
        code: 'AUTH_006',
      });
    });

    it('throws AUTH_006 (401) when no active token row matches', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user_1' });
      refreshTokenRepository.findActiveByHash.mockResolvedValue(null);

      await expect(service.refresh('some-token')).rejects.toMatchObject({
        httpStatus: 401,
        code: 'AUTH_006',
      });
    });

    it('throws AUTH_006 (401) when the token owner no longer exists', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user_1' });
      refreshTokenRepository.findActiveByHash.mockResolvedValue({
        id: 'rt_1',
      } as never);
      userRepository.findById.mockResolvedValue(null);

      await expect(service.refresh('some-token')).rejects.toMatchObject({
        httpStatus: 401,
        code: 'AUTH_006',
      });
    });

    it('rotates the refresh token and issues a new pair on success', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user_1' });
      refreshTokenRepository.findActiveByHash.mockResolvedValue({
        id: 'rt_old',
      } as never);
      userRepository.findById.mockResolvedValue(fakeUser);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      jwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      refreshTokenRepository.create.mockResolvedValue({
        id: 'rt_new',
      } as never);

      const result = await service.refresh('old-token');

      expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('rt_old');
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });
  });

  describe('logout', () => {
    it('is a no-op when the refresh token cannot be verified', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await service.logout('user_1', 'bad-token');

      expect(refreshTokenRepository.findActiveByHash).not.toHaveBeenCalled();
      expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
    });

    it('is a no-op when the token belongs to a different user', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'someone-else' });

      await service.logout('user_1', 'token');

      expect(refreshTokenRepository.findActiveByHash).not.toHaveBeenCalled();
    });

    it('is a no-op when no active token row matches', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user_1' });
      refreshTokenRepository.findActiveByHash.mockResolvedValue(null);

      await service.logout('user_1', 'token');

      expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
    });

    it('revokes the matching token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user_1' });
      refreshTokenRepository.findActiveByHash.mockResolvedValue({
        id: 'rt_1',
      } as never);

      await service.logout('user_1', 'token');

      expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('rt_1');
    });
  });
});
