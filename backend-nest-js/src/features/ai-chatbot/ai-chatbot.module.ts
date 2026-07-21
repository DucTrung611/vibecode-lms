import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { ChatController } from './controllers/chat.controller';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { ChatSessionRepository } from './repositories/chat-session.repository';
import { DocumentChunkRepository } from './repositories/document-chunk.repository';
import { ChatService } from './services/chat.service';

@Module({
  imports: [CoursesModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatSessionRepository,
    ChatMessageRepository,
    DocumentChunkRepository,
  ],
  exports: [ChatService],
})
export class AiChatbotModule {}
