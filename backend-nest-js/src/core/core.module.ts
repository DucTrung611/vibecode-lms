import { Global, Module } from '@nestjs/common';
import { AiClientService } from './ai/ai-client.service';
import { PrismaService } from './database/prisma.service';

@Global()
@Module({
  providers: [PrismaService, AiClientService],
  exports: [PrismaService, AiClientService],
})
export class CoreModule {}
