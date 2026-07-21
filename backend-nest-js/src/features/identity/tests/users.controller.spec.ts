import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<
    Pick<UsersService, 'getProfile' | 'updateProfile'>
  >;

  beforeEach(() => {
    usersService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    };
    controller = new UsersController(usersService as unknown as UsersService);
  });

  describe('getMe', () => {
    it('delegates to usersService.getProfile with the current user id', async () => {
      usersService.getProfile.mockResolvedValue({ id: 'user_1' } as never);

      const result = await controller.getMe('user_1');

      expect(usersService.getProfile).toHaveBeenCalledWith('user_1');
      expect(result).toEqual({ id: 'user_1' });
    });
  });

  describe('updateMe', () => {
    it('delegates to usersService.updateProfile with the current user id and DTO', async () => {
      const dto = { fullName: 'New Name' };
      usersService.updateProfile.mockResolvedValue({
        id: 'user_1',
        fullName: 'New Name',
      } as never);

      const result = await controller.updateMe('user_1', dto);

      expect(usersService.updateProfile).toHaveBeenCalledWith('user_1', dto);
      expect(result).toEqual({ id: 'user_1', fullName: 'New Name' });
    });
  });
});
