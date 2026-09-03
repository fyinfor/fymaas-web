import { queryUserDirectory } from '@/pages/users/apis';
import { nsLocal } from '@gpustack/core-ui/utils';
import { request } from '@umijs/max';

export type PersonOption = { id: number; name: string };

export const readCurrentOrgId = (): number | null => {
  try {
    const raw = nsLocal.get('currentOrganizationId');
    if (!raw) return null;
    const value = JSON.parse(raw);
    return typeof value === 'number' ? value : null;
  } catch {
    return null;
  }
};

export async function loadEnterprisePeople(): Promise<PersonOption[]> {
  const options: PersonOption[] = [];
  const orgId = readCurrentOrgId();
  if (orgId) {
    try {
      const members = await request(`/organizations/${orgId}/members`);
      if (Array.isArray(members)) {
        options.push(
          ...members.map((item: any) => ({
            id: item.principal_id,
            name:
              item.principal_display_name ||
              item.principal_name ||
              String(item.principal_id)
          }))
        );
      }
    } catch {
      // Org owners still have the directory below.
    }
  }
  try {
    const directory = await queryUserDirectory({ page: 1, perPage: 100 });
    for (const item of directory.items || []) {
      if (!options.some((row) => row.id === item.id)) {
        options.push({
          id: item.id,
          name: item.full_name || item.username || String(item.id)
        });
      }
    }
  } catch {
    // Keep whatever the membership list already gave us.
  }
  return options;
}
