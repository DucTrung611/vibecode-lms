import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GradeSubmissionDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  score: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
