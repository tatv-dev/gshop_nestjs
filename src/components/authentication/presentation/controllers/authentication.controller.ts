// src/components/authentication/presentation/controllers/authentication.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { BasicAuthenticationRequestDTO } from '../requests/login.request';
import { RefreshTokenRequestDTO } from '../requests/refresh-token.request';
import { AuthenticationResponseDTO } from '../responses/login.response';
import { BasicAuthenticationDTO } from '../../application/dtos/basic-authentication.dto';
import { BasicAuthenticationCommand } from '../../application/commands/basic-authentication.command';
import { RefreshTokenCommand } from '../../application/commands/refresh-token.command';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthenticationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with username and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: AuthenticationResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        success: false,
        error: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS',
        timestamp: '2025-01-01T00:00:00.000Z',
        path: '/api/v1/auth/login',
        method: 'POST',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Account locked or no active workspace',
    schema: {
      example: {
        success: false,
        error: 'Account is locked due to too many failed login attempts',
        code: 'ACCOUNT_LOCKED',
        timestamp: '2025-01-01T00:00:00.000Z',
        path: '/api/v1/auth/login',
        method: 'POST',
        lockTime: 1735689600,
      },
    },
  })
  async login(
    @Body() request: BasicAuthenticationRequestDTO,
  ): Promise<AuthenticationResponseDTO> {
    const dto = new BasicAuthenticationDTO(
      request.username,
      request.password,
      request.softwareId,
    );

    const command = new BasicAuthenticationCommand(dto);
    return this.commandBus.execute(command);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully refreshed tokens',
    type: AuthenticationResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired refresh token',
    schema: {
      example: {
        success: false,
        error: 'Invalid refresh token',
        code: 'UNAUTHORIZED',
        timestamp: '2025-01-01T00:00:00.000Z',
        path: '/api/v1/auth/refresh',
        method: 'POST',
      },
    },
  })
  async refreshToken(
    @Body() request: RefreshTokenRequestDTO,
  ): Promise<AuthenticationResponseDTO> {
    const command = new RefreshTokenCommand(request.refreshToken);
    return this.commandBus.execute(command);
  }
}