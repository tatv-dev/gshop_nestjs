// src/components/authentication/presentation/responses/login.response.ts
import { ApiProperty } from '@nestjs/swagger';

export class AuthenticationResponseDTO {
  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  static create(accessToken: string, refreshToken: string): AuthenticationResponseDTO {
    return new AuthenticationResponseDTO(accessToken, refreshToken);
  }
}