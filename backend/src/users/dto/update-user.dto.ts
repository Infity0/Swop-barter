import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(500, { message: 'Описание не должно превышать 500 символов' })
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Город должен быть строкой' })
  @MaxLength(100, { message: 'Название города не должно превышать 100 символов' })
  city?: string;
}
