import { BaseEntity } from '../../../../shared/domain/entities/base.entity';

export class Workspace extends BaseEntity {
  private userId: string;
  private tenantId: string;
  private employeeId: string;
  private status: number;
  private branchId: number;
  private employeeActiveStatus: number;
  private tenantName: string;
  private permissions: string[];

  constructor(
    id: string,
    userId: string,
    tenantId: string,
    employeeId: string,
    status: number,
    branchId: number,
    employeeActiveStatus: number,
    tenantName: string,
    permissions: string[],
  ) {
    super(id);
    this.userId = userId;
    this.tenantId = tenantId;
    this.employeeId = employeeId;
    this.status = status;
    this.branchId = branchId;
    this.employeeActiveStatus = employeeActiveStatus;
    this.tenantName = tenantName;
    this.permissions = permissions;
  }

  getUserId(): string {
    return this.userId;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getEmployeeId(): string {
    return this.employeeId;
  }

  getStatus(): number {
    return this.status;
  }

  getbranchId(): number {
    return this.branchId;
  }

  getEmployeeActiveStatus(): number {
    return this.employeeActiveStatus;
  }

  getTenantName(): string {
    return this.tenantName;
  }

  getPermissions(): string[] {
    return this.permissions;
  }

  isActive(): boolean {
    return this.status === 1 && this.employeeActiveStatus === 1;
  }

  protected generateId(): string {
    return require('uuid').v4();
  }
}
