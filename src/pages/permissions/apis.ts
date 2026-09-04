import { request } from '@umijs/max';

export type PermissionItem = {
  key: string;
  group: string;
  description: string;
};

export type RoleItem = {
  id: number;
  name: string;
  code?: string;
  builtin?: boolean;
  is_active?: boolean;
  scope?: string;
  permissions?: string[];
};

export const queryPermissionCatalog = () =>
  request<PermissionItem[]>('/roles/permissions');

export const queryRoles = () =>
  request<{ items: RoleItem[] }>('/roles', {
    params: { page: 1, perPage: 200 }
  });

export const patchRolePermission = (
  roleId: number,
  permission: string,
  granted: boolean
) =>
  request<RoleItem>(`/roles/${roleId}/permissions`, {
    method: 'PATCH',
    data: { permission, granted }
  });

export const replaceRolePermissions = (roleId: number, permissions: string[]) =>
  request<RoleItem>(`/roles/${roleId}`, {
    method: 'PUT',
    data: { permissions }
  });
