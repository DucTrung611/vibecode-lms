import { User } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { UsersService } from '../services/users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Pick<UserRepository, 'findById' | 'update'>>;

  const fakeUser: User = {
    id: 'user_1',
    email: 'a@b.com',
    password: 'hashed',
    fullName: 'A B',
    avatarUrl: null,
    bio: null,
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    service = new UsersService(userRepository as unknown as UserRepository);
  });

  describe('getProfile', () => {
    it('throws AUTH_007 (404) when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getProfile('missing')).rejects.toMatchObject({
        httpStatus: 404,
        code: 'AUTH_007',
      });
    });

    it('returns a UserEntity without the password field', async () => {
      userRepository.findById.mockResolvedValue(fakeUser);

      const result = await service.getProfile('user_1');

      expect(result).toMatchObject({
        id: 'user_1',
        email: 'a@b.com',
        fullName: 'A B',
        role: 'STUDENT',
      });
      expect(
        (result as unknown as { password?: string }).password,
      ).toBeUndefined();
    });
  });

  describe('updateProfile', () => {
    it('throws AUTH_007 (404) when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile('missing', { fullName: 'New' }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'AUTH_007' });
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('updates and returns the refreshed entity', async () => {
      userRepository.findById.mockResolvedValue(fakeUser);
      userRepository.update.mockResolvedValue({
        ...fakeUser,
        fullName: 'New Name',
      });

      const result = await service.updateProfile('user_1', {
        fullName: 'New Name',
      });

      expect(userRepository.update).toHaveBeenCalledWith('user_1', {
        fullName: 'New Name',
      });
      expect(result.fullName).toBe('New Name');
    });
  });

  describe('findById', () => {
    it('delegates to getProfile', async () => {
      userRepository.findById.mockResolvedValue(fakeUser);

      const result = await service.findById('user_1');

      expect(result.id).toBe('user_1');
    });
  });
});
