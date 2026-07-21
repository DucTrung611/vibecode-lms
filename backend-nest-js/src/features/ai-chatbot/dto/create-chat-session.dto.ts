import { IsOptional, IsString } from 'class-validator';

export class CreateChatSessionDto {
  @IsOptional()
  @IsString()
  courseId?: string;
}
