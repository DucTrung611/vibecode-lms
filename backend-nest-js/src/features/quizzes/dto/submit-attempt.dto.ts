import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsOptional()
  @IsString()
  selectedOptionId?: string;

  @IsOptional()
  @IsString()
  answerText?: string;
}

export class SubmitAttemptDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}
