import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateChatSessionDto } from '../dto/create-chat-session.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { ChatService } from '../services/chat.service';

@Controller('chat/sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(
    @CurrentUser('id') studentId: string,
    @Body() dto: CreateChatSessionDto,
  ) {
    return this.chatService.createSession(studentId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser('id') studentId: string, @Param('id') id: string) {
    return this.chatService.getSession(studentId, id);
  }

  @Post(':id/messages')
  sendMessage(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(studentId, id, dto);
  }
}
