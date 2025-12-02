import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BasicAuthenticationDTO } from '../dtos/basic-authentication.dto';
import { AuthenticationResponseDTO } from '../dtos/authentication-response.dto';
import { IUserAuthenticationRepository } from '../../domain/repositories/user-authentication.repository';
import { IPermissionRepository } from '../../domain/repositories/permission.repository';
import { IEncryptionPort } from '../../domain/ports/encryption.port';
import { IJWTTokenPort } from '../../domain/ports/jwt-token.port';
import { AuthErrorException } from '../../../../shared/application/exceptions/auth-error.exception';

export class BasicAuthenticationCommand {
  constructor(public readonly dto: BasicAuthenticationDTO) {}
}

@CommandHandler(BasicAuthenticationCommand)
export class BasicAuthenticationCommandHandler 
  implements ICommandHandler<BasicAuthenticationCommand, AuthenticationResponseDTO> {
  constructor(
    @Inject('IUserAuthenticationRepository')
    private readonly userRepository: IUserAuthenticationRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject(IEncryptionPort)
    private readonly encryptionPort: IEncryptionPort,
    @Inject(IJWTTokenPort)
    private readonly jwtTokenPort: IJWTTokenPort,
  ) {}

  async execute(command: BasicAuthenticationCommand): Promise<AuthenticationResponseDTO> {
    const { dto } = command;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Find user by username
    const user = await this.userRepository.findUserByUsername(
      dto.username,
      dto.softwareId,
    );
    console.log('User found:', user);

    if (!user) {
      throw new AuthErrorException({
        messageKey: 'auth_invalid_credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked(currentTimestamp)) {
      throw new AuthErrorException({
        messageKey: 'account_locked',
        params: { lockTime: user.getAutoLockTime() }
      });
    }

    // Verify password
    const isPasswordValid = await this.encryptionPort.verify(
      dto.password,
      user.getPassword(),
    );

    if (!isPasswordValid) {
      user.incrementLockCounter(currentTimestamp);
      await this.userRepository.updateUserLockInfo(
        user.id,
        user.getLockCounter(),
        user.getAutoLockTime(),
      );
      throw new AuthErrorException({
        messageKey: 'auth_invalid_credentials'
      });
    }

    // Reset lock counter on successful authentication
    user.resetLock();
    await this.userRepository.resetUserLock(user.id);

    // Find all workspaces for user
    const workspaces = await this.userRepository.findAllWorkspacesByUsername(
      dto.username,
      dto.softwareId,
      [0, 1],
    );

    const activeWorkspaces = workspaces.filter((w) => w.isActive());

    if (activeWorkspaces.length === 0) {
      throw new AuthErrorException({
        messageKey: 'auth_invalid_credentials'
      });
    }

    let tokenPayload;

    // Generate tokens based on number of active workspaces
    if (activeWorkspaces.length === 1) {
      const workspace = activeWorkspaces[0];
      const permissions = await this.permissionRepository.getUserPermissionsByWorkspace(
        workspace.id,
        dto.softwareId,
      );

      tokenPayload = await this.jwtTokenPort.generateAndSaveNewTokens({
        userId: user.id,
        softwareId: dto.softwareId,
        workspaceId: workspace.id,
        tenantId: workspace.getTenantId(),
        branchId: workspace.getbranchId(),
        employeeId: workspace.getEmployeeId(),
        permissions,
      });
    } else {
      // Multiple workspaces
      const workspaceList = activeWorkspaces.map((w) => ({
        workspaceId: w.id,
        tenantId: w.getTenantId(),
        tenantName: w.getTenantName(),
        branchId: w.getbranchId(),
        employeeId: w.getEmployeeId(),
      }));

      tokenPayload = await this.jwtTokenPort.generateTokensForMultipleWorkspaces({
        userId: user.id,
        softwareId: dto.softwareId,
        workspaces: workspaceList,
      });
    }
      console.log("tokenPayload: ", tokenPayload)

    return new AuthenticationResponseDTO(
      tokenPayload.accessToken,
      tokenPayload.refreshToken,
    );
  }
}