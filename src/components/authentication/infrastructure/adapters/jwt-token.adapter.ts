// src/components/authentication/infrastructure/adapters/jwt-token.adapter.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJWTTokenPort, ITokenPayload, ITokenGenerationParams, IMultiWorkspaceTokenParams, IRefreshTokenPayload } from '../../domain/ports/jwt-token.port';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenModel } from '../entities/refresh-token.model';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';

@Injectable()
export class JWTTokenAdapter implements IJWTTokenPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshTokenModel)
    private readonly refreshTokenRepository: Repository<RefreshTokenModel>,
  ) {}

  async generateAndSaveNewTokens(params: ITokenGenerationParams): Promise<ITokenPayload> {
    const accessTokenPayload = {
      userId: params.userId,
      softwareId: params.softwareId,
      workspaceId: params.workspaceId,
      tenantId: params.tenantId,
      branchId: params.branchId,
      employeeId: params.employeeId,
      permissions: params.permissions,
      getPermission: 0,
    };

    const refreshTokenPayload = {
      userId: params.userId,
      softwareId: params.softwareId,
      workspaceId: params.workspaceId,
      tenantId: params.tenantId,
      type: 'refresh',
    };


    const accessExpiresIn = (this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN') ?? '7d') as SignOptions['expiresIn'];
    const refreshExpiresIn = (this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') ?? '30d') as SignOptions['expiresIn'];

    const accessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: accessExpiresIn });
    const refreshToken = this.jwtService.sign(refreshTokenPayload, { expiresIn: refreshExpiresIn });

    // Save refresh token to database
    await this.saveRefreshToken(
      params.userId,
      params.softwareId,
      params.workspaceId,
      params.tenantId,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateTokensForMultipleWorkspaces(params: IMultiWorkspaceTokenParams): Promise<ITokenPayload> {
    const accessTokenPayload = {
      userId: params.userId,
      softwareId: params.softwareId,
      workspaces: params.workspaces,
      getPermission: 1,
    };

    const refreshTokenPayload = {
      userId: params.userId,
      softwareId: params.softwareId,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(refreshTokenPayload, { expiresIn: '7d' });

    // Save refresh token to database
    const firstWorkspace = params.workspaces[0];
    await this.saveRefreshToken(
      params.userId,
      params.softwareId,
      null,
      null,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<ITokenPayload> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      const tokenHash = this.hashToken(refreshToken);

      // Verify token exists in database and is not revoked
      const storedToken = await this.refreshTokenRepository.findOne({
        where: {
          token_hash: tokenHash,
          user_id: parseInt(payload.userId),
          revoked: 0,
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      // Check if token is expired
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (currentTimestamp > storedToken.expires_at) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Revoke old refresh token
      await this.refreshTokenRepository.update(
        { id: storedToken.id },
        { revoked: 1 },
      );

      // Generate new tokens with the same payload structure
      if (payload.workspaceId && payload.tenantId) {
        // Single workspace scenario - need to fetch permissions
        const accessTokenPayload = {
          userId: payload.userId,
          softwareId: payload.softwareId,
          workspaceId: payload.workspaceId,
          tenantId: payload.tenantId,
          getPermission: 0,
        };

        const newRefreshTokenPayload = {
          userId: payload.userId,
          softwareId: payload.softwareId,
          workspaceId: payload.workspaceId,
          tenantId: payload.tenantId,
          type: 'refresh',
        };

        const accessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: '1h' });
        const newRefreshToken = this.jwtService.sign(newRefreshTokenPayload, { expiresIn: '7d' });

        await this.saveRefreshToken(
          payload.userId,
          payload.softwareId,
          payload.workspaceId,
          payload.tenantId,
          newRefreshToken,
        );

        return {
          accessToken,
          refreshToken: newRefreshToken,
        };
      } else {
        // Multiple workspaces scenario
        const accessTokenPayload = {
          userId: payload.userId,
          softwareId: payload.softwareId,
          getPermission: 1,
        };

        const newRefreshTokenPayload = {
          userId: payload.userId,
          softwareId: payload.softwareId,
          type: 'refresh',
        };

        const accessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: '1h' });
        const newRefreshToken = this.jwtService.sign(newRefreshTokenPayload, { expiresIn: '7d' });

        await this.saveRefreshToken(
          payload.userId,
          payload.softwareId,
          null,
          null,
          newRefreshToken,
        );

        return {
          accessToken,
          refreshToken: newRefreshToken,
        };
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<IRefreshTokenPayload> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      return {
        userId: payload.userId,
        softwareId: payload.softwareId,
        workspaceId: payload.workspaceId,
        tenantId: payload.tenantId,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async saveRefreshToken(
    userId: string,
    softwareId: number,
    workspaceId: string | null,
    tenantId: string | null,
    refreshToken: string,
  ): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days

    const refreshTokenModel = new RefreshTokenModel();
    refreshTokenModel.user_id = parseInt(userId);
    refreshTokenModel.software_id = softwareId;
    refreshTokenModel.workspace_id = workspaceId ? parseInt(workspaceId) : null;
    refreshTokenModel.tenant_id = tenantId ? parseInt(tenantId) : null;
    refreshTokenModel.token_hash = tokenHash;
    refreshTokenModel.revoked = 0;
    refreshTokenModel.expires_at = expiresAt;
    refreshTokenModel.require_update_permission = 0;

    await this.refreshTokenRepository.save(refreshTokenModel);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}