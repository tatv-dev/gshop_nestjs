import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuthenticationResponseDTO } from '../dtos/authentication-response.dto';
import { IJWTTokenPort } from '../../domain/ports/jwt-token.port';

export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler 
  implements ICommandHandler<RefreshTokenCommand, AuthenticationResponseDTO> {
  constructor(
    @Inject(IJWTTokenPort)
    private readonly jwtTokenPort: IJWTTokenPort,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthenticationResponseDTO> {
    const tokenPayload = await this.jwtTokenPort.refreshAccessToken(command.refreshToken);

    return new AuthenticationResponseDTO(
      tokenPayload.accessToken,
      tokenPayload.refreshToken,
    );
  }
}