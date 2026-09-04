// Widens the OSS access predicates for fymaas enterprise.
//
// `access.ts` stays an identity over platform-admin flags. This seam
// is what lets an Org owner — and anyone holding an extra RBAC
// binding — see the matching menus without editing the upstream file.
// Membership comes from `organizationList`; effective permission
// points from `enterprisePermissions`. Both are written on boot by
// the enterprise plugin.

import { nsLocal } from '@gpustack/core-ui/utils';

export type AccessPredicates = {
  canSeeAdmin: boolean;
  canSeeOrgAdmin: boolean;
  canManageCurrentOrg: boolean;
  canSeeUser: boolean;
  canDelete: boolean;
  canLogin: boolean;
  canSeeGpuService?: boolean;
  canSeeQuotas?: boolean;
  canSeeBilling?: boolean;
  canSeeRoles?: boolean;
  canSeeAudit?: boolean;
  canSeeIpAccess?: boolean;
  canSeePermissions?: boolean;
  canSeeTopology?: boolean;
  canSeeRollouts?: boolean;
};

type CachedMembership = {
  id?: number;
  role?: string;
  is_personal?: boolean;
};

const readMemberships = (): CachedMembership[] => {
  try {
    const raw = nsLocal.get('organizationList');
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const readCurrentOrgId = (): number | null => {
  try {
    const raw = nsLocal.get('currentOrganizationId');
    if (!raw) return null;
    const value = JSON.parse(raw);
    return typeof value === 'number' ? value : null;
  } catch {
    return null;
  }
};

const readPermissions = (): string[] => {
  try {
    const raw = nsLocal.get('enterprisePermissions');
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const isOwnerOf = (item: CachedMembership): boolean =>
  item.role === 'owner' && !item.is_personal;

const has = (perms: string[], key: string): boolean => perms.includes(key);

export const applyAccessExtensions = <T extends AccessPredicates>(
  base: T
): T => {
  const memberships = readMemberships();
  const orgId = readCurrentOrgId();
  const perms = readPermissions();
  const isOwnerSomewhere = memberships.some(isOwnerOf);
  const current = memberships.find((item) => String(item.id) === String(orgId));
  const isOwnerHere = current ? isOwnerOf(current) : false;
  const canManageByRole = orgId != null && isOwnerHere;
  const canSeeByPerm =
    has(perms, 'quota:read') ||
    has(perms, 'billing:read') ||
    has(perms, 'role:read') ||
    has(perms, 'ipacl:read') ||
    has(perms, 'audit:read') ||
    has(perms, 'cluster:read') ||
    has(perms, 'org:write');

  return {
    ...base,
    canSeeOrgAdmin:
      base.canSeeOrgAdmin || isOwnerSomewhere || isOwnerHere || canSeeByPerm,
    canManageCurrentOrg:
      base.canManageCurrentOrg ||
      canManageByRole ||
      has(perms, 'org:write') ||
      has(perms, 'role:write'),
    canSeeQuotas: base.canSeeAdmin || has(perms, 'quota:read') || isOwnerHere,
    canSeeBilling:
      base.canSeeAdmin || has(perms, 'billing:read') || isOwnerHere,
    canSeeRoles: base.canSeeAdmin || has(perms, 'role:read') || isOwnerHere,
    canSeePermissions:
      base.canSeeAdmin || has(perms, 'role:read') || isOwnerHere,
    canSeeAudit: base.canSeeAdmin || has(perms, 'audit:read') || isOwnerHere,
    canSeeIpAccess:
      base.canSeeAdmin || canManageByRole || has(perms, 'ipacl:read'),
    canSeeTopology:
      base.canSeeAdmin || has(perms, 'cluster:read') || isOwnerHere,
    canSeeRollouts: base.canSeeAdmin || has(perms, 'route:write') || isOwnerHere
  };
};
