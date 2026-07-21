import { ArrayNotEmpty, ArrayUnique, IsArray, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  courseIds: string[];
}
