import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ItemCondition } from '../entities/item.entity';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @ApiProperty()
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно для заполнения' })
  @MinLength(3, { message: 'Название должно содержать не менее 3 символов' })
  @MaxLength(100, { message: 'Название не должно превышать 100 символов' })
  title: string;

  @ApiProperty()
  @IsString({ message: 'Описание должно быть строкой' })
  @IsNotEmpty({ message: 'Описание обязательно для заполнения' })
  @MinLength(10, { message: 'Описание должно содержать не менее 10 символов' })
  @MaxLength(2000, { message: 'Описание не должно превышать 2000 символов' })
  description: string;

  @ApiProperty({ enum: ItemCondition })
  @IsEnum(ItemCondition, { message: 'Неверное значение состояния товара' })
  condition: ItemCondition;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Оценочная стоимость должна быть числом' })
  estimatedValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Город должен быть строкой' })
  @MaxLength(100, { message: 'Название города не должно превышать 100 символов' })
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Категория должна быть строкой' })
  categoryId?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray({ message: 'Желаемые предметы должны быть массивом' })
  @IsString({ each: true, message: 'Каждый желаемый предмет должен быть строкой' })
  desiredItems?: string[];
}
