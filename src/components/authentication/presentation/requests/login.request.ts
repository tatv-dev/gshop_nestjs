// src/components/authentication/presentation/requests/login.request.ts
import { IsString, IsNotEmpty, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BasicAuthenticationRequestDTO {
  @ApiProperty({
    description: 'Username',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Software ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  softwareId: number;
}