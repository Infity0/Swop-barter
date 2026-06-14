import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail({}, { message: 'Неверный формат email' })
  email: string;

  @ApiProperty({ example: 'john_doe' })
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @MinLength(3, { message: 'Имя пользователя должно содержать не менее 3 символов' })
  @MaxLength(30, { message: 'Имя пользователя не должно превышать 30 символов' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Имя пользователя может содержать только латинские буквы, цифры и знак подчёркивания',
  })
  username: string;

  @ApiProperty({ example: 'StrongPass1!' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов' })
  @MaxLength(64, { message: 'Пароль не должен превышать 64 символов' })
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString({ message: 'Имя должно быть строкой' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
  lastName?: string;
}
