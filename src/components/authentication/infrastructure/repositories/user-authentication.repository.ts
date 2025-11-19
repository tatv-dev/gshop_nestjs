// src/components/authentication/infrastructure/repositories/user-authentication.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IUserAuthenticationRepository } from '../../domain/repositories/user-authentication.repository';
import { User } from '../../domain/entities/user.entity';
import { Workspace } from '../../domain/entities/workspace.entity';
import { UserModel } from '../entities/user.model';
import { WorkspaceModel } from '../entities/workspace.model';

@Injectable()
export class UserAuthenticationRepository implements IUserAuthenticationRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly userModel: Repository<UserModel>,
    @InjectRepository(WorkspaceModel)
    private readonly workspaceModel: Repository<WorkspaceModel>,
  ) {}

  async findUserByUsername(
    username: string,
    softwareId: number,
  ): Promise<User | null> {
    const userModel = await this.userModel.findOne({
      where: { user_name: username },
    });

    if (!userModel) {
      return null;
    }

    return new User(
      userModel.id.toString(),
      userModel.user_name,
      userModel.password,
      userModel.phone_number,
      userModel.lock_counter,
      userModel.auto_lock_time,
    );
  }

  async findAllWorkspacesByUsername(
    username: string,
    softwareId: number,
    statuses: number[],
  ): Promise<Workspace[]> {
    const query = `
      SELECT 
        w.id as workspaceId,
        u.id as userId,
        t.id as tenantId,
        e.id as employeeId,
        b.id as branchId,
        w.status,
        e.status as employeeActiveStatus,
        t.name as tenantName,
        p.name as permission_name
      FROM users u
      JOIN workspaces w ON u.id = w.user_id
      JOIN tenants t ON w.tenant_id = t.id
      JOIN employees e ON e.workspace_id = w.id
      LEFT JOIN branches b ON b.tenant_id = t.id AND b.status = 1
      LEFT JOIN role_workspaces rw ON rw.workspace_id = w.id
      LEFT JOIN role_permissions rp ON rw.role_id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.user_name = ? AND w.status IN (?)
      GROUP BY w.id, u.id, t.id, e.id, b.id, w.status, e.status, t.name, p.name
      ORDER BY w.id, b.id
    `;

    const results = await this.userModel.query(query, [username, statuses]);

    const workspaceMap = new Map<string, Workspace>();

    results.forEach((row) => {
      const workspaceKey = `${row.workspaceId}_${row.branchId}`;
      
      if (!workspaceMap.has(workspaceKey)) {
        workspaceMap.set(
          workspaceKey,
          new Workspace(
            row.workspaceId,
            row.userId,
            row.tenantId,
            row.employeeId,
            row.status,
            row.branchId || 1,
            row.employeeActiveStatus,
            row.tenantName,
            [],
          ),
        );
      }

      if (row.permission_name) {
        const workspace = workspaceMap.get(workspaceKey);
        if (workspace && !workspace.getPermissions().includes(row.permission_name)) {
          workspace.getPermissions().push(row.permission_name);
        }
      }
    });

    return Array.from(workspaceMap.values());
  }

  async updateUserLockInfo(
    userId: string,
    lockCounter: number,
    autoLockTime: number | null,
  ): Promise<void> {
    await this.userModel.update(
      { id: parseInt(userId) },
      {
        lock_counter: lockCounter,
        auto_lock_time: autoLockTime,
      },
    );
  }

  async resetUserLock(userId: string): Promise<void> {
    await this.userModel.update(
      { id: parseInt(userId) },
      {
        lock_counter: 0,
        auto_lock_time: null,
      },
    );
  }
}