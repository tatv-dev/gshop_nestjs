// src/components/authentication/domain/ports/jwt-token.port.ts
export interface ITokenPayload {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenGenerationParams {
  userId: string;
  softwareId: number;
  workspaceId: string;
  tenantId: string;
  branchId: number;
  employeeId: string;
  permissions: string[];
}

export interface IMultiWorkspaceTokenParams {
  softwareId: number;
  userId: string;
  workspaces: Array<{
    workspaceId: string;
    tenantId: string;
    tenantName: string;
    branchId: number;
    employeeId: string;
  }>;
}

export interface IRefreshTokenPayload {
  userId: string;
  softwareId: number;
  workspaceId?: string;
  tenantId?: string;
}

export interface IJWTTokenPort {
  generateAndSaveNewTokens(params: ITokenGenerationParams): Promise<ITokenPayload>;
  generateTokensForMultipleWorkspaces(params: IMultiWorkspaceTokenParams): Promise<ITokenPayload>;
  refreshAccessToken(refreshToken: string): Promise<ITokenPayload>;
  verifyRefreshToken(refreshToken: string): Promise<IRefreshTokenPayload>;
}

export const IJWTTokenPort = Symbol('IJWTTokenPort');