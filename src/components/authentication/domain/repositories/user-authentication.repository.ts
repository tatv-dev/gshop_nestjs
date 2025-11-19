import { User } from '../entities/user.entity';
import { Workspace } from '../entities/workspace.entity';

export interface IUserAuthenticationRepository {
  findUserByUsername(username: string, softwareId: number): Promise<User | null>;
  
  findAllWorkspacesByUsername(
    username: string,
    softwareId: number,
    statuses: number[],
  ): Promise<Workspace[]>;
  
  updateUserLockInfo(
    userId: string,
    lockCounter: number,
    autoLockTime: number | null,
  ): Promise<void>;
  
  resetUserLock(userId: string): Promise<void>;
}

export const IUserAuthenticationRepository = Symbol('IUserAuthenticationRepository');