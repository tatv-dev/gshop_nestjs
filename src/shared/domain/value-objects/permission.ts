 
// src/shared/domain/value-objects/permission.ts
export enum PermissionType {
  OWNER = 'owner',
  EDIT = 'edit',
  VIEW = 'view',
}

export class Permission {
  private readonly type: PermissionType;

  constructor(type: PermissionType) {
    this.type = type;
  }

  getType(): PermissionType {
    return this.type;
  }

  canRead(): boolean {
    return true; // All permissions can read
  }

  canEdit(): boolean {
    return this.type === PermissionType.OWNER || this.type === PermissionType.EDIT;
  }

  canDelete(): boolean {
    return this.type === PermissionType.OWNER;
  }

  canShare(): boolean {
    return this.type === PermissionType.OWNER;
  }

  canChangePublicStatus(): boolean {
    return this.type === PermissionType.OWNER;
  }

  isHigherThan(other: Permission): boolean {
    const hierarchy = {
      [PermissionType.VIEW]: 1,
      [PermissionType.EDIT]: 2,
      [PermissionType.OWNER]: 3,
    };
    return hierarchy[this.type] > hierarchy[other.type];
  }

  equals(other: Permission): boolean {
    return this.type === other.type;
  }

  toString(): string {
    return this.type;
  }
}