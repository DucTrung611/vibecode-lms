import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfig } from '../../config/configuration';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        secret: configService.get('jwt', { infer: true }).accessSecret,
        signOptions: {
          // env-driven duration string (e.g. "15m"), not a StringValue literal
          expiresIn: configService.get('jwt', { infer: true })
            .accessExpiresIn as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    UsersService,
    UserRepository,
    RefreshTokenRepository,
    JwtStrategy,
  ],
  exports: [AuthService, UsersService],
})
export class IdentityModule {}
