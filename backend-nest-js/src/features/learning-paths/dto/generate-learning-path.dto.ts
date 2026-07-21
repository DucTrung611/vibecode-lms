import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateLearningPathDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;
}
