import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from '../../../config/configuration';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { UserEntity } from '../entities/user.entity';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UserRepository } from '../repositories/user.repository';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
  TokenPair,
} from '../types/identity.types';
import { comparePassword, hashPassword } from '../utils/password.util';
import { hashRefreshToken } from '../utils/refresh-token.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: RegisterDto): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ApiException(409, 'AUTH_004', 'Email already registered');
    }

    const password = await hashPassword(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      password,
      fullName: dto.fullName,
      role: dto.role,
    });

    this.logger.log(`Registered new user ${user.id}`);
    return UserEntity.fromPrisma(user);
  }

  async login(dto: LoginDto): Promise<TokenPair & { user: UserEntity }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !(await comparePassword(dto.password, user.password))) {
      throw new ApiException(401, 'AUTH_005', 'Invalid email or password');
    }

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    return { ...tokens, user: UserEntity.fromPrisma(user) };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);

    const stored = await this.refreshTokenRepository.findActiveByHash(
      payload.sub,
      tokenHash,
    );
    if (!stored) {
      throw new ApiException(
        401,
        'AUTH_006',
        'Invalid or revoked refresh token',
      );
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new ApiException(
        401,
        'AUTH_006',
        'Invalid or revoked refresh token',
      );
    }

    await this.refreshTokenRepository.revoke(stored.id);
    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    let payload: JwtRefreshPayload;
    try {
      payload = await this.verifyRefreshToken(refreshToken);
    } catch {
      return;
    }

    if (payload.sub !== userId) {
      return;
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await this.refreshTokenRepository.findActiveByHash(
      userId,
      tokenHash,
    );
    if (stored) {
      await this.refreshTokenRepository.revoke(stored.id);
    }
  }

  private async verifyRefreshToken(token: string): Promise<JwtRefreshPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtRefreshPayload>(token, {
        secret: this.configService.get('jwt', { infer: true }).refreshSecret,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        throw new ApiException(401, 'AUTH_002', 'Refresh token expired');
      }
      throw new ApiException(
        401,
        'AUTH_006',
        'Invalid or revoked refresh token',
      );
    }
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokenPair> {
    const jwtConfig = this.configService.get('jwt', { infer: true });

    const accessPayload: JwtAccessPayload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: jwtConfig.accessSecret,
      // env-driven duration string (e.g. "15m"), not a StringValue literal
      expiresIn: jwtConfig.accessExpiresIn as unknown as number,
    });

    const refreshPayload: JwtRefreshPayload = { sub: userId };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn as unknown as number,
    });

    const decoded = this.jwtService.decode<{ exp: number }>(refreshToken);
    await this.refreshTokenRepository.create({
      userId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000),
    });

    return { accessToken, refreshToken };
  }
}
