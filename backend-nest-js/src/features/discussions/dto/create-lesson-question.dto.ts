import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLessonQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
