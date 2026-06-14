import { IsInt, IsString, IsOptional, Min, Max, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty()
  @IsUUID('all', { message: 'Неверный идентификатор пользователя' })
  revieweeId: string;

  @ApiProperty()
  @IsUUID('all', { message: 'Неверный идентификатор сделки' })
  tradeOfferId: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt({ message: 'Оценка должна быть целым числом' })
  @Min(1, { message: 'Минимальная оценка — 1' })
  @Max(5, { message: 'Максимальная оценка — 5' })
  rating: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MaxLength(1000, { message: 'Комментарий не должен превышать 1000 символов' })
  comment?: string;
}
