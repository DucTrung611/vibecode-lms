import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AppConfig } from '../../config/configuration';
import { UploadsController } from './controllers/uploads.controller';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        storage: diskStorage({
          destination: configService.get('storage', { infer: true }).localPath,
          filename: (_req, file, callback) => {
            callback(null, `${randomUUID()}${extname(file.originalname)}`);
          },
        }),
        limits: { fileSize: MAX_FILE_SIZE_BYTES },
      }),
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
