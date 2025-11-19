import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: any) {
    if (!payload.userId || !payload.softwareId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.userId,
      softwareId: payload.softwareId,
      workspaceId: payload.workspaceId,
      tenantId: payload.tenantId,
      employeeId: payload.employeeId,
      permissions: payload.permissions || [],
      workspaces: payload.workspaces || [],
      getPermission: payload.getPermission || 0,
      branchId: payload.branchId,
    };
  }
}