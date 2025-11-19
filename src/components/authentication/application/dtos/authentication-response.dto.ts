// src/components/authentication/application/dtos/authentication-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AuthenticationResponseDTO {
  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  constructor(accessToken: string, refreshToken: string) {
    this.access_token = accessToken;
    this.refresh_token = refreshToken;
  }

  static create(accessToken: string, refreshToken: string): AuthenticationResponseDTO {
    return new AuthenticationResponseDTO(accessToken, refreshToken);
  }
}