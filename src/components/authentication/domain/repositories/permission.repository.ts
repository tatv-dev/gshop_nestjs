export interface IPermissionRepository {
  getUserPermissionsByWorkspace(
    workspaceId: string,
    softwareId: number,
  ): Promise<string[]>;
}

export const IPermissionRepository = Symbol('IPermissionRepository');