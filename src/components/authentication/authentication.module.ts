import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Entities
import { UserModel } from './infrastructure/entities/user.model';
import { WorkspaceModel } from './infrastructure/entities/workspace.model';
import { TenantModel } from './infrastructure/entities/tenant.model';
import { EmployeeModel } from './infrastructure/entities/employee.model';
import { RefreshTokenModel } from './infrastructure/entities/refresh-token.model';

// Controllers
import { AuthenticationController } from './presentation/controllers/authentication.controller';

// Command Handlers
import { BasicAuthenticationCommandHandler } from './application/commands/basic-authentication.command';
import { RefreshTokenCommandHandler } from './application/commands/refresh-token.command';

// Repositories
import { UserAuthenticationRepository } from './infrastructure/repositories/user-authentication.repository';
import { PermissionRepository } from './infrastructure/repositories/permission.repository';

// Adapters
import { BcryptEncryptionAdapter } from './infrastructure/adapters/bcrypt-encryption.adapter';
import { JWTTokenAdapter } from './infrastructure/adapters/jwt-token.adapter';

// Strategies
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.ts';

// Port Symbols
import { IEncryptionPort } from './domain/ports/encryption.port';
import { IJWTTokenPort } from './domain/ports/jwt-token.port';

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      UserModel,
      WorkspaceModel,
      TenantModel,
      EmployeeModel,
      RefreshTokenModel,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '1h'),
        },
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    // Strategy
    JwtStrategy,

    // Command Handlers
    BasicAuthenticationCommandHandler,
    RefreshTokenCommandHandler,

    // Repositories
    {
      provide: 'IUserAuthenticationRepository',
      useClass: UserAuthenticationRepository,
    },
    {
      provide: 'IPermissionRepository',
      useClass: PermissionRepository,
    },

    // Adapters
    {
      provide: IEncryptionPort,
      useClass: BcryptEncryptionAdapter,
    },
    {
      provide: IJWTTokenPort,
      useClass: JWTTokenAdapter,
    },
  ],
  exports: ['IUserAuthenticationRepository', 'IPermissionRepository'],
})
export class AuthenticationModule {}