import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<
    Pick<AuthService, 'register' | 'login' | 'refresh' | 'logout'>
  >;

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  describe('register', () => {
    it('delegates to authService.register with the DTO', async () => {
      const dto = {
        email: 'a@b.com',
        password: 'password123',
        fullName: 'A B',
        role: 'STUDENT' as const,
      };
      authService.register.mockResolvedValue({ id: 'user_1' } as never);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'user_1' });
    });
  });

  describe('login', () => {
    it('delegates to authService.login with the DTO', async () => {
      const dto = { email: 'a@b.com', password: 'password123' };
      authService.login.mockResolvedValue({
        accessToken: 'a',
        refreshToken: 'r',
      } as never);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
    });
  });

  describe('refresh', () => {
    it('delegates to authService.refresh with the raw token', async () => {
      authService.refresh.mockResolvedValue({
        accessToken: 'a',
        refreshToken: 'r',
      });

      const result = await controller.refresh({ refreshToken: 'old-token' });

      expect(authService.refresh).toHaveBeenCalledWith('old-token');
      expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
    });
  });

  describe('logout', () => {
    it('delegates to authService.logout with the current user id and token', async () => {
      authService.logout.mockResolvedValue(undefined);

      await controller.logout('user_1', { refreshToken: 'old-token' });

      expect(authService.logout).toHaveBeenCalledWith('user_1', 'old-token');
    });
  });
});
