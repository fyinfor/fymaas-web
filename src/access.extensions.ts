// Widens the OSS access predicates for fymaas enterprise.
//
// `access.ts` stays an identity over platform-admin flags. This seam
// is what lets an Org owner see the same management menus without
// editing the upstream file. Membership comes from the cache the
// enterprise plugin writes on boot (`organizationList`).

import { nsLocal } from '@gpustack/core-ui/utils';

export type AccessPredicates = {
  canSeeAdmin: boolean;
  canSeeOrgAdmin: boolean;
  canManageCurrentOrg: boolean;
  canSeeUser: boolean;
  canDelete: boolean;
  canLogin: boolean;
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

const isOwnerOf = (item: CachedMembership): boolean =>
  item.role === 'owner' && !item.is_personal;

export const applyAccessExtensions = <T extends AccessPredicates>(
  base: T
): T => {
  const memberships = readMemberships();
  const orgId = readCurrentOrgId();
  const isOwnerSomewhere = memberships.some(isOwnerOf);
  const current = memberships.find((item) => String(item.id) === String(orgId));
  const isOwnerHere = current ? isOwnerOf(current) : false;

  return {
    ...base,
    canSeeOrgAdmin: base.canSeeOrgAdmin || isOwnerSomewhere || isOwnerHere,
    canManageCurrentOrg:
      base.canManageCurrentOrg || (orgId != null && isOwnerHere)
  };
};
