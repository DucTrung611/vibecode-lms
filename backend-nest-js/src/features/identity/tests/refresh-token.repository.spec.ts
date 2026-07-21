import { RefreshToken } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

describe('RefreshTokenRepository', () => {
  let repository: RefreshTokenRepository;
  let prisma: {
    refreshToken: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  const fakeToken = { id: 'rt_1' } as RefreshToken;

  beforeEach(() => {
    prisma = {
      refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new RefreshTokenRepository(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.refreshToken.create.mockResolvedValue(fakeToken);
      const data = {
        userId: 'user_1',
        tokenHash: 'hash',
        expiresAt: new Date('2026-01-01'),
      };

      const result = await repository.create(data);

      expect(prisma.refreshToken.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeToken);
    });
  });

  describe('findActiveByHash', () => {
    it('queries for a non-revoked, non-expired token owned by the user', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue(fakeToken);

      const result = await repository.findActiveByHash('user_1', 'hash');

      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user_1',
          tokenHash: 'hash',
          revokedAt: null,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          expiresAt: { gt: expect.any(Date) },
        },
      });
      expect(result).toBe(fakeToken);
    });

    it('returns null when no active token matches', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue(null);

      const result = await repository.findActiveByHash('user_1', 'hash');

      expect(result).toBeNull();
    });
  });

  describe('revoke', () => {
    it('sets revokedAt on the given token id', async () => {
      prisma.refreshToken.update.mockResolvedValue(fakeToken);

      const result = await repository.revoke('rt_1');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt_1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { revokedAt: expect.any(Date) },
      });
      expect(result).toBe(fakeToken);
    });
  });
});
