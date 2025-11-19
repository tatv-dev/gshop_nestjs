import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPermissionRepository } from '../../domain/repositories/permission.repository';
import { EmployeeModel } from '../entities/employee.model';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(EmployeeModel)
    private readonly employeeModel: Repository<EmployeeModel>,
  ) {}

  async getUserPermissionsByWorkspace(
    workspaceId: string,
    softwareId: number,
  ): Promise<string[]> {
    const query = `
      SELECT DISTINCT p.name as permission_name
      FROM workspaces w
      JOIN employees e ON e.workspace_id = w.id
      JOIN role_workspaces rw ON rw.workspace_id = e.workspace_id
      JOIN role_permissions rp ON rp.role_id = rw.role_id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE w.id = ? AND p.software_id = ?
    `;

    const results = await this.employeeModel.query(query, [
      workspaceId,
      softwareId,
    ]);

    return results.map((r) => r.permission_name).filter((name) => name != null);
  }
}