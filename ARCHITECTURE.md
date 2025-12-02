# Authentication System - Architecture & Code Flow Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Layer Architecture](#layer-architecture)
4. [Authentication Flow](#authentication-flow)
5. [Refresh Token Flow](#refresh-token-flow)
6. [Component Interactions](#component-interactions)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Security Architecture](#security-architecture)

---

## System Overview

Hệ thống authentication được xây dựng theo **Clean Architecture** và **Domain-Driven Design (DDD)**, sử dụng **CQRS pattern** với NestJS framework.

### Key Technologies
- **NestJS**: Framework backend
- **TypeORM**: ORM cho database
- **JWT**: JSON Web Tokens cho authentication
- **Bcrypt**: Password hashing
- **CQRS**: Command Query Responsibility Segregation
- **Passport**: Authentication middleware

### Core Principles
- **Separation of Concerns**: Tách biệt domain logic, application logic và infrastructure
- **Dependency Inversion**: Domain không phụ thuộc vào infrastructure
- **Single Responsibility**: Mỗi class có một trách nhiệm duy nhất
- **Interface Segregation**: Sử dụng ports/interfaces để decouple

---

## Architecture Patterns
- **DDD** = định nghĩa *nội dung bên trong domain* (entity, aggregate, VO…)  
- **Hexagon** = định nghĩa *cấu trúc dự án và cách domain giao tiếp với bên ngoài*  
- **CQRS** = định nghĩa *cách xử lý use case: đọc và ghi tách biệt*

### 1. Clean Architecture (Hexagonal Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│            (Controllers, DTOs, Filters)                  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   Application Layer                      │
│          (Commands, Queries, Use Cases)                  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                     Domain Layer                         │
│     (Entities, Value Objects, Domain Services,           │
│      Domain Events, Business Rules)                      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 Infrastructure Layer                     │
│    (Database, External Services, Adapters)               │
└─────────────────────────────────────────────────────────┘
```

### 2. CQRS Pattern

```
                    ┌──────────────┐
                    │   Controller  │
                    └───────┬───────┘
                            │
                 ┌──────────▼──────────┐
                 │    CommandBus       │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
    ┌─────▼─────┐                      ┌─────▼─────┐
    │  Command  │                      │   Query   │
    │  Handler  │                      │  Handler  │
    └─────┬─────┘                      └─────┬─────┘
          │                                   │
    ┌─────▼─────┐                      ┌─────▼─────┐
    │  Domain   │                      │   Read    │
    │  Service  │                      │   Model   │
    └───────────┘                      └───────────┘
```

---

## Layer Architecture

### 1. Presentation Layer (Interface Adapters)

**Trách nhiệm**: 
- Nhận HTTP requests
- Validate input data
- Transform data thành DTOs
- Gọi Application Layer
- Return responses

**Components**:
```typescript
src/components/authentication/presentation/
├── controllers/
│   ├── authentication.controller.ts      // HTTP endpoints
│   ├── login.request.ts                  // Request validation DTOs
│   └── refresh-token.request.ts
├── responses/
│   └── login.response.ts                 // Response DTOs
└── filters/
    └── authentication-exception.filter.ts // Error handling
```

**Example Flow**:
```typescript
@Controller('api/v1/auth')
export class AuthenticationController {
  @Post('login')
  async login(@Body() request: BasicAuthenticationRequestDTO) {
    // 1. Validate request (automatic via class-validator)
    // 2. Transform to DTO
    const dto = new BasicAuthenticationDTO(
      request.username,
      request.password,
      request.softwareId
    );
    // 3. Send command to application layer
    const command = new BasicAuthenticationCommand(dto);
    return this.commandBus.execute(command);
  }
}
```

### 2. Application Layer (Use Cases)

**Trách nhiệm**:
- Orchestrate business logic
- Coordinate domain objects
- Manage transactions
- Call domain services

**Components**:
```typescript
src/components/authentication/application/
├── commands/
│   ├── basic-authentication.command.ts   // Login use case
│   └── refresh-token.command.ts          // Refresh token use case
├── queries/
│   └── [future query handlers]
└── dtos/
    ├── basic-authentication.dto.ts       // Application DTOs
    └── authentication-response.dto.ts
```

**Command Handler Pattern**:
```typescript
@CommandHandler(BasicAuthenticationCommand)
export class BasicAuthenticationCommandHandler {
  async execute(command: BasicAuthenticationCommand) {
    // 1. Get user from repository
    const user = await this.userRepository.findUserByUsername(...);
    
    // 2. Verify credentials (domain logic)
    const isValid = await this.encryptionPort.verify(...);
    
    // 3. Business rules (domain logic)
    if (user.isLocked()) {
      throw new ApplicationException({
        messageKey: 'account_locked',
      });
    }
    
    // 4. Get permissions
    const permissions = await this.permissionRepository.getUserPermissions(...);
    
    // 5. Generate tokens (infrastructure)
    const tokens = await this.jwtTokenPort.generateAndSaveNewTokens(...);
    
    // 6. Return response
    return new AuthenticationResponseDTO(...);
  }
}
```

### 3. Domain Layer (Business Logic)

**Trách nhiệm**:
- Define business entities
- Implement business rules
- Define domain events
- Pure business logic (không phụ thuộc infrastructure)

**Components**:
```typescript
src/components/authentication/domain/
├── entities/
│   ├── user.entity.ts                    // User aggregate root
│   └── workspace.entity.ts               // Workspace entity
├── value-objects/
│   └── token-pair.ts                     // Token value object
├── repositories/                          // Repository interfaces (ports)
│   ├── user-authentication.repository.ts
│   └── permission.repository.ts
├── ports/                                 // Infrastructure interfaces
│   ├── jwt-token.port.ts
│   └── encryption.port.ts
└── errors/
    └── authentication.error.ts           // Domain exceptions
```

**Entity Example**:
```typescript
export class User extends BaseEntity {
  private lockCounter: number;
  private autoLockTime: number | null;

  // Business rule: Account is locked after 5 failed attempts
  isLocked(currentTimestamp: number): boolean {
    if (!this.autoLockTime) return false;
    return currentTimestamp < this.autoLockTime;
  }

  // Business rule: Increment lock counter
  incrementLockCounter(currentTimestamp: number): void {
    this.lockCounter += 1;
    if (this.lockCounter >= 5) {
      this.autoLockTime = currentTimestamp + 15 * 60; // 15 minutes
    }
    this.touch();
  }

  // Business rule: Reset lock on successful login
  resetLock(): void {
    this.lockCounter = 0;
    this.autoLockTime = null;
    this.touch();
  }
}
```

**Repository Interface (Port)**:
```typescript
// Domain định nghĩa interface, không implementation
export interface IUserAuthenticationRepository {
  findUserByUsername(username: string, softwareId: number): Promise<User | null>;
  findAllWorkspacesByUsername(...): Promise<Workspace[]>;
  updateUserLockInfo(...): Promise<void>;
  resetUserLock(userId: string): Promise<void>;
}
```

### 4. Infrastructure Layer (Technical Implementation)

**Trách nhiệm**:
- Implement repository interfaces
- Database access (TypeORM)
- External service integration
- Technical utilities

**Components**:
```typescript
src/components/authentication/infrastructure/
├── entities/                              // TypeORM models
│   ├── user.model.ts
│   ├── workspace.model.ts
│   ├── tenant.model.ts
│   ├── employee.model.ts
│   └── refresh-token.model.ts
├── repositories/                          // Repository implementations
│   ├── user-authentication.repository.ts
│   └── permission.repository.ts
├── adapters/                              // Port implementations
│   ├── jwt-token.adapter.ts
│   └── bcrypt-encryption.adapter.ts
└── strategies/
    └── jwt.strategy.ts                   // Passport JWT strategy
```

**Repository Implementation**:
```typescript
@Injectable()
export class UserAuthenticationRepository implements IUserAuthenticationRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly userModel: Repository<UserModel>,
  ) {}

  async findUserByUsername(username: string): Promise<User | null> {
    // 1. Query database using TypeORM
    const userModel = await this.userModel.findOne({
      where: { user_name: username },
    });

    if (!userModel) return null;

    // 2. Map ORM model to domain entity
    return new User(
      userModel.id.toString(),
      userModel.user_name,
      userModel.password,
      userModel.phone_number,
      userModel.lock_counter,
      userModel.auto_lock_time,
    );
  }
}
```

**Adapter Pattern (Port Implementation)**:
```typescript
@Injectable()
export class JWTTokenAdapter implements IJWTTokenPort {
  constructor(private readonly jwtService: JwtService) {}

  async generateAndSaveNewTokens(params: ITokenGenerationParams): Promise<ITokenPayload> {
    // 1. Create token payload
    const accessTokenPayload = {
      userId: params.userId,
      permissions: params.permissions,
      // ... other fields
    };

    // 2. Sign JWT token
    const accessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(refreshTokenPayload, { expiresIn: '7d' });

    // 3. Save refresh token to database
    await this.saveRefreshToken(...);

    return { accessToken, refreshToken };
  }
}
```

---

## Authentication Flow

### Complete Login Flow

```
┌─────────┐         ┌────────────┐         ┌───────────────┐         ┌──────────┐
│ Client  │         │ Controller │         │ CommandHandler│         │ Domain   │
└────┬────┘         └─────┬──────┘         └───────┬───────┘         └────┬─────┘
     │                    │                        │                      │
     │ POST /login        │                        │                      │
     ├───────────────────>│                        │                      │
     │                    │                        │                      │
     │                    │ 1. Validate Request    │                      │
     │                    │                        │                      │
     │                    │ 2. Create Command      │                      │
     │                    ├───────────────────────>│                      │
     │                    │                        │                      │
     │                    │                        │ 3. Find User         │
     │                    │                        ├─────────────────────>│
     │                    │                        │                      │
     │                    │                        │ 4. Check Locked      │
     │                    │                        │<─────────────────────┤
     │                    │                        │                      │
     │                    │                        │ 5. Verify Password   │
     │                    │                        │                      │
     │                    │                        │ 6. Update Lock Info  │
     │                    │                        │                      │
     │                    │                        │ 7. Get Workspaces    │
     │                    │                        │                      │
     │                    │                        │ 8. Get Permissions   │
     │                    │                        │                      │
     │                    │                        │ 9. Generate Tokens   │
     │                    │                        │                      │
     │                    │ 10. Return Response    │                      │
     │                    │<───────────────────────┤                      │
     │                    │                        │                      │
     │ Response (Tokens)  │                        │                      │
     │<───────────────────┤                        │                      │
     │                    │                        │                      │
```

### Detailed Step-by-Step Flow

#### Step 1: HTTP Request
```typescript
// Client sends request
POST /api/v1/auth/login
{
  "username": "user@example.com",
  "password": "password123",
  "softwareId": 1
}
```

#### Step 2: Controller Layer
```typescript
@Controller('api/v1/auth')
export class AuthenticationController {
  @Public()  // Bypass JWT guard
  @Post('login')
  async login(@Body() request: BasicAuthenticationRequestDTO) {
    // Validate request (automatic)
    // Transform to DTO
    const dto = new BasicAuthenticationDTO(
      request.username,
      request.password,
      request.softwareId
    );
    
    // Create command
    const command = new BasicAuthenticationCommand(dto);
    
    // Execute via CQRS
    return this.commandBus.execute(command);
  }
}
```

#### Step 3: Command Handler (Application Layer)
```typescript
@CommandHandler(BasicAuthenticationCommand)
export class BasicAuthenticationCommandHandler {
  async execute(command: BasicAuthenticationCommand): Promise<AuthenticationResponseDTO> {
    const { dto } = command;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Step 3.1: Find user
    const user = await this.userRepository.findUserByUsername(
      dto.username,
      dto.softwareId
    );

    if (!user) {
      throw new AuthErrorException('auth_invalid_credentials');
    }

    // Step 3.2: Check if account is locked (Domain logic)
    if (user.isLocked(currentTimestamp)) {
      throw new ApplicationException({
        messageKey: 'account_locked',
        params: { lockTime: user.getAutoLockTime() }
      });
    }

    // Step 3.3: Verify password (Infrastructure)
    const isPasswordValid = await this.encryptionPort.verify(
      dto.password,
      user.getPassword()
    );

    if (!isPasswordValid) {
      // Business rule: Increment lock counter
      user.incrementLockCounter(currentTimestamp);
      await this.userRepository.updateUserLockInfo(
        user.id,
        user.getLockCounter(),
        user.getAutoLockTime()
      );
      throw new AuthErrorException('auth_invalid_credentials');
    }

    // Step 3.4: Reset lock on success (Domain logic)
    user.resetLock();
    await this.userRepository.resetUserLock(user.id);

    // Step 3.5: Get all workspaces
    const workspaces = await this.userRepository.findAllWorkspacesByUsername(
      dto.username,
      dto.softwareId,
      [0, 1]
    );

    const activeWorkspaces = workspaces.filter(w => w.isActive());

    if (activeWorkspaces.length === 0) {
      throw new NoActiveWorkspaceError();
    }

    // Step 3.6: Generate tokens based on workspace count
    let tokenPayload;

    if (activeWorkspaces.length === 1) {
      // Single workspace - include permissions
      const workspace = activeWorkspaces[0];
      const permissions = await this.permissionRepository.getUserPermissionsByWorkspace(
        workspace.id,
        dto.softwareId
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
      // Multiple workspaces - user must select
      const workspaceList = activeWorkspaces.map(w => ({
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

    // Step 3.7: Return response
    return new AuthenticationResponseDTO(
      tokenPayload.accessToken,
      tokenPayload.refreshToken
    );
  }
}
```

#### Step 4: Token Generation (Infrastructure Layer)
```typescript
@Injectable()
export class JWTTokenAdapter implements IJWTTokenPort {
  async generateAndSaveNewTokens(params: ITokenGenerationParams): Promise<ITokenPayload> {
    // Create access token payload with permissions
    const accessTokenPayload = {
      userId: params.userId,
      softwareId: params.softwareId,
      workspaceId: params.workspaceId,
      tenantId: params.tenantId,
      branchId: params.branchId,
      employeeId: params.employeeId,
      permissions: params.permissions,  // ← Permissions signed in token
      getPermission: 0,
    };

    // Create refresh token payload
    const refreshTokenPayload = {
      userId: params.userId,
      softwareId: params.softwareId,
      workspaceId: params.workspaceId,
      tenantId: params.tenantId,
      type: 'refresh',
    };

    // Sign tokens
    const accessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(refreshTokenPayload, { expiresIn: '7d' });

    // Save refresh token to database (hashed)
    await this.saveRefreshToken(
      params.userId,
      params.softwareId,
      params.workspaceId,
      params.tenantId,
      refreshToken
    );

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(...): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

    const refreshTokenModel = new RefreshTokenModel();
    refreshTokenModel.user_id = parseInt(userId);
    refreshTokenModel.token_hash = tokenHash;  // ← Store hashed token
    refreshTokenModel.expires_at = expiresAt;
    // ... other fields

    await this.refreshTokenRepository.save(refreshTokenModel);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
```

#### Step 5: Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJzb2Z0d2FyZUlkIjoxLCJ3b3Jrc3BhY2VJZCI6IjQ1NiIsInRlbmFudElkIjoiNzg5IiwicGVybWlzc2lvbnMiOlsidXNlci5yZWFkIiwidXNlci53cml0ZSJdLCJnZXRQZXJtaXNzaW9uIjowfQ...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJzb2Z0d2FyZUlkIjoxLCJ0eXBlIjoicmVmcmVzaCJ9..."
}
```

---

## Refresh Token Flow

### Complete Refresh Flow

```
┌─────────┐         ┌────────────┐         ┌───────────────┐         ┌──────────┐
│ Client  │         │ Controller │         │ CommandHandler│         │ Database │
└────┬────┘         └─────┬──────┘         └───────┬───────┘         └────┬─────┘
     │                    │                        │                      │
     │ POST /refresh      │                        │                      │
     ├───────────────────>│                        │                      │
     │                    │                        │                      │
     │                    │ 1. Create Command      │                      │
     │                    ├───────────────────────>│                      │
     │                    │                        │                      │
     │                    │                        │ 2. Verify Token      │
     │                    │                        │                      │
     │                    │                        │ 3. Check DB          │
     │                    │                        ├─────────────────────>│
     │                    │                        │                      │
     │                    │                        │ 4. Validate Not      │
     │                    │                        │    Revoked/Expired   │
     │                    │                        │<─────────────────────┤
     │                    │                        │                      │
     │                    │                        │ 5. Revoke Old Token  │
     │                    │                        ├─────────────────────>│
     │                    │                        │                      │
     │                    │                        │ 6. Generate New      │
     │                    │                        │    Tokens            │
     │                    │                        │                      │
     │                    │                        │ 7. Save New Token    │
     │                    │                        ├─────────────────────>│
     │                    │                        │                      │
     │                    │ 8. Return Response     │                      │
     │                    │<───────────────────────┤                      │
     │                    │                        │                      │
     │ Response (Tokens)  │                        │                      │
     │<───────────────────┤                        │                      │
     │                    │                        │                      │
```

### Detailed Refresh Flow

```typescript
// Step 1: Client sends refresh request
POST /api/v1/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Step 2: Command Handler
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler {
  async execute(command: RefreshTokenCommand): Promise<AuthenticationResponseDTO> {
    // Delegate to JWT adapter
    const tokenPayload = await this.jwtTokenPort.refreshAccessToken(
      command.refreshToken
    );

    return new AuthenticationResponseDTO(
      tokenPayload.accessToken,
      tokenPayload.refreshToken
    );
  }
}

// Step 3: JWT Adapter - Refresh Logic
async refreshAccessToken(refreshToken: string): Promise<ITokenPayload> {
  // Step 3.1: Verify JWT signature and decode
  const payload = await this.verifyRefreshToken(refreshToken);
  
  // Step 3.2: Hash token for database lookup
  const tokenHash = this.hashToken(refreshToken);

  // Step 3.3: Check if token exists and not revoked
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

  // Step 3.4: Check expiration
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (currentTimestamp > storedToken.expires_at) {
    throw new UnauthorizedException('Refresh token has expired');
  }

  // Step 3.5: Revoke old refresh token
  await this.refreshTokenRepository.update(
    { id: storedToken.id },
    { revoked: 1 }
  );

  // Step 3.6: Generate new tokens
  // (Logic depends on single vs multiple workspace)
  if (payload.workspaceId && payload.tenantId) {
    // Single workspace - generate with same context
    const accessTokenPayload = {
      userId: payload.userId,
      softwareId: payload.softwareId,
      workspaceId: payload.workspaceId,
      tenantId: payload.tenantId,
      getPermission: 0,
    };

    const newAccessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: '1h' });
    const newRefreshToken = this.jwtService.sign({...}, { expiresIn: '7d' });

    // Step 3.7: Save new refresh token
    await this.saveRefreshToken(...);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } else {
    // Multiple workspaces scenario
    // ...
  }
}
```

---

## Component Interactions

### Dependency Injection Flow

```
┌──────────────────────────────────────────────────────┐
│             AuthenticationModule                      │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │           Providers (DI Container)             │ │
│  │                                                │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │  Command Handlers                        │ │ │
│  │  │  - BasicAuthenticationCommandHandler     │ │ │
│  │  │  - RefreshTokenCommandHandler            │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │                                                │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │  Repositories (Domain → Infrastructure) │ │ │
│  │  │  IUserAuthenticationRepository           │ │ │
│  │  │      ↓ implements                         │ │ │
│  │  │  UserAuthenticationRepository            │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │                                                │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │  Adapters (Ports → Infrastructure)       │ │ │
│  │  │  IEncryptionPort                         │ │ │
│  │  │      ↓ implements                         │ │ │
│  │  │  BcryptEncryptionAdapter                 │ │ │
│  │  │                                           │ │ │
│  │  │  IJWTTokenPort                           │ │ │
│  │  │      ↓ implements                         │ │ │
│  │  │  JWTTokenAdapter                         │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Port-Adapter Pattern (Hexagonal Architecture)

```
                        Domain Layer
                    (Business Logic Core)
                            │
                            │ defines
                            ▼
                    ┌───────────────┐
                    │     Ports     │  ← Interfaces
                    │  (Interfaces) │
                    └───────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌───────────────┐ ┌────────────┐ ┌───────────────┐
    │  Repository   │ │ Encryption │ │  JWT Token    │
    │    Adapter    │ │   Adapter  │ │    Adapter    │
    └───────┬───────┘ └─────┬──────┘ └───────┬───────┘
            │               │               │
            ▼               ▼               ▼
    ┌───────────────┐ ┌────────────┐ ┌───────────────┐
    │   TypeORM     │ │   Bcrypt   │ │  JWT Service  │
    │   Database    │ │            │ │               │
    └───────────────┘ └────────────┘ └───────────────┘
```

### Request-Response Lifecycle

```
1. HTTP Request
   │
   ├─> ValidationPipe (automatic)
   │
2. Controller
   │
   ├─> Transform to DTO
   ├─> Create Command
   ├─> CommandBus.execute()
   │
3. Command Handler
   │
   ├─> Inject Dependencies
   │   ├─> UserRepository (via interface)
   │   ├─> PermissionRepository (via interface)
   │   ├─> EncryptionPort (via interface)
   │   └─> JWTTokenPort (via interface)
   │
   ├─> Execute Business Logic
   │   ├─> Domain Entity Methods
   │   ├─> Business Rules Validation
   │   └─> Domain Events (if any)
   │
   ├─> Call Infrastructure Services
   │   ├─> Database Queries
   │   ├─> Password Verification
   │   └─> Token Generation
   │
4. Response
   │
   ├─> Transform to Response DTO
   │
5. HTTP Response (JSON)
```

---

## Data Flow Diagrams

### Entity Relationship in Domain

```
┌─────────────────────┐
│       User          │
│  - id               │
│  - userName         │
│  - password         │
│  - lockCounter      │
│  - autoLockTime     │
│                     │
│  + isLocked()       │
│  + incrementLock()  │
│  + resetLock()      │
└──────────┬──────────┘
           │ 1
           │
           │ has many
           │
           │ *
┌──────────▼──────────┐
│     Workspace       │
│  - id               │
│  - userId           │
│  - tenantId         │
│  - employeeId       │
│  - status           │
│  - permissions[]    │
│                     │
│  + isActive()       │
│  + getTenantId()    │
│  + getPermissions() │
└─────────────────────┘
```

### Database Schema Flow

```
┌─────────┐       ┌─────────────┐       ┌──────────┐
│  users  │──────<│ workspaces  │>──────│ tenants  │
└────┬────┘ 1   * └──────┬──────┘ *   1 └──────────┘
     │                   │
     │ 1                 │ 1
     │                   │
     │ *                 │ *
     │            ┌──────▼──────────┐
     │            │   employees     │
     │            └──────┬──────────┘
     │                   │ 1
     │                   │
     │                   │ *
     │            ┌──────▼──────────┐
     │            │ role_permissions│
     │            └──────┬──────────┘
     │                   │ *
     │                   │
     │                   │ 1
     │            ┌──────▼──────────┐
     │            │  permissions    │
     │            └─────────────────┘
     │
     │ 1
     │
     │ *
┌────▼──────────────┐
│ refresh_tokens    │
│  - id             │
│  - user_id        │
│  - token_hash     │
│  - revoked        │
│  - expires_at     │
└───────────────────┘
```

---

## Security Architecture

### 1. Password Security

```
User Password
     │
     ├─> Bcrypt Hash (10 rounds)
     │   │
     │   ├─> Salt Generation (automatic)
     │   │
     │   └─> Hash Result
     │       │
     │       └─> Store in Database
     │
Verification
     │
     ├─> User Input Password
     │
     ├─> Bcrypt Compare
     │   │
     │   └─> Hash(input) vs Stored Hash
     │
     └─> Boolean Result
```

### 2. Token Security

```
Access Token (JWT)
├─> Payload: { userId, permissions, workspaceId, ... }
├─> Signature: HMAC SHA256(header + payload, secret)
├─> Expiration: 1 hour
└─> Storage: Client-side (localStorage/memory)

Refresh Token (JWT)
├─> Payload: { userId, softwareId, type: 'refresh' }
├─> Signature: HMAC SHA256(header + payload, secret)
├─> Expiration: 7 days
├─> Hash: SHA256(token) → Store in database
└─> Storage: 
    ├─> Client: Secure HTTP-only cookie (recommended)
    └─> Database: Hashed version only
```

### 3. Authentication Guard Flow

```
HTTP Request
     │
     ├─> Extract Token from Header
     │   Authorization: Bearer <token>
     │
     ├─> JwtStrategy.validate()
     │   │
     │   ├─> Verify JWT Signature
     │   │
     │   ├─> Check Expiration
     │   │
     │   └─> Decode Payload
     │
     ├─> JwtAuthGuard.canActivate()
     │   │
     │   ├─> Check @Public() decorator
     │   │   │
     │   │   ├─> Yes → Allow Request
     │   │   │
     │   │   └─> No → Check Authentication
     │   │
     │   └─> Attach User to Request
     │
     └─> Controller Handler
         │
         └─> Access user via @CurrentUser() decorator
```

### 4. Authorization Flow (Permission-Based)

```
Request to Protected Resource
     │
     ├─> JWT Guard (Authentication)
     │   └─> Extract user with permissions from token
     │
     ├─> Permission Guard (Authorization)
     │   │
     │   ├─> Get required permission for endpoint
     │   │
     │   ├─> Check user.permissions.includes(required)
     │   │
     │   ├─> Yes → Allow
     │   │
     │   └─> No → 403 Forbidden
     │
     └─> Execute Handler
```

### 5. Account Locking Mechanism

```
Login Attempt
     │
     ├─> Check user.isLocked()
     │   │
     │   ├─> Locked → Return 403 with lockTime
     │   │
     │   └─> Not Locked → Continue
     │
     ├─> Verify Password
     │   │
     │   ├─> Invalid
     │   │   │
     │   │   ├─> lockCounter++
     │   │   │
     │   │   ├─> if lockCounter >= 5
     │   │   │   │
     │   │   │   └─> autoLockTime = now + 15 minutes
     │   │   │
     │   │   └─> Save to DB
     │   │
     │   └─> Valid
     │       │
     │       ├─> lockCounter = 0
     │       ├─> autoLockTime = null
     │       │
     │       └─> Generate Tokens
     │
     └─> Return Response
```

---

## Best Practices Applied

### 1. Separation of Concerns
- **Domain** không biết về database, HTTP, hay JWT
- **Application** orchestrate nhưng không chứa business logic
- **Infrastructure** implement technical details

### 2. Dependency Inversion
```typescript
// Domain defines interface (Port)
export interface IEncryptionPort {
  hash(data: string): Promise<string>;
  verify(data: string, hash: string): Promise<boolean>;
}

// Infrastructure implements (Adapter)
@Injectable()
export class BcryptEncryptionAdapter implements IEncryptionPort {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

// Application depends on abstraction
constructor(
  @Inject(IEncryptionPort)
  private readonly encryptionPort: IEncryptionPort
) {}
```

### 3. Single Responsibility
- Mỗi class có một lý do duy nhất để thay đổi
- Command Handler chỉ orchestrate
- Entity chỉ chứa business rules
- Repository chỉ lo database access

### 4. Open/Closed Principle
- Có thể mở rộng (extend) mà không modify code cũ
- Ví dụ: Thêm authentication method mới (OAuth, SAML) bằng cách implement interface

### 5. Testing Strategy
```
Unit Tests
├─> Domain Entities (pure logic, no dependencies)
├─> Value Objects
└─> Business Rules

Integration Tests
├─> Command Handlers (with mocked dependencies)
├─> Repositories (with test database)
└─> API Endpoints (E2E)

Mocking Strategy
├─> Mock Repositories (use interfaces)
├─> Mock External Services (use ports)
└─> Keep Domain Pure (no mocking needed)
```

---

## Summary

### Key Takeaways

1. **Clean Architecture**: Tách biệt rõ ràng giữa các layers
2. **CQRS**: Commands cho write operations, queries cho read
3. **DDD**: Business logic tập trung trong Domain entities
4. **Ports & Adapters**: Decouple domain khỏi infrastructure
5. **Security**: Multi-layer security với JWT, hashing, và account locking
6. **Scalability**: Dễ dàng thêm features mới mà không ảnh hưởng code cũ

### Flow Summary

```
HTTP Request
    ↓
Controller (Validation)
    ↓
Command/Query (CQRS)
    ↓
Command Handler (Orchestration)
    ↓
Domain Entities (Business Logic)
    ↓
Repositories/Ports (Abstraction)
    ↓
Infrastructure (Implementation)
    ↓
HTTP Response
```

This architecture ensures:
- ✅ Maintainability
- ✅ Testability
- ✅ Scalability
- ✅ Security
- ✅ Flexibility