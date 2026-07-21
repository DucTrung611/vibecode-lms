import { User } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { UserRepository } from '../repositories/user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const fakeUser = { id: 'user_1' } as User;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new UserRepository(prisma as unknown as PrismaService);
  });

  describe('findByEmail', () => {
    it('queries by unique email', async () => {
      prisma.user.findUnique.mockResolvedValue(fakeUser);

      const result = await repository.findByEmail('a@b.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
      });
      expect(result).toBe(fakeUser);
    });
  });

  describe('findById', () => {
    it('queries by unique id', async () => {
      prisma.user.findUnique.mockResolvedValue(fakeUser);

      const result = await repository.findById('user_1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_1' },
      });
      expect(result).toBe(fakeUser);
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.user.create.mockResolvedValue(fakeUser);
      const data = {
        email: 'a@b.com',
        password: 'hashed',
        fullName: 'A B',
        role: 'STUDENT' as const,
      };

      const result = await repository.create(data);

      expect(prisma.user.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeUser);
    });
  });

  describe('update', () => {
    it('updates by id with the given partial data', async () => {
      prisma.user.update.mockResolvedValue(fakeUser);
      const data = { fullName: 'New Name' };

      const result = await repository.update('user_1', data);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        data,
      });
      expect(result).toBe(fakeUser);
    });
  });
});
