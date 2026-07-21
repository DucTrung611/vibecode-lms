import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CourseLevel } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
