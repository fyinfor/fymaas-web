export const PLATFORM_ADMIN_ROLE = 'platform-admin';
export const PLATFORM_USER_ROLE = 'platform-user';

const BUILTIN_LABELS: Record<string, string> = {
  [PLATFORM_ADMIN_ROLE]: 'users.form.admin',
  [PLATFORM_USER_ROLE]: 'users.form.user'
};

export type CatalogRole = {
  id: number;
  name: string;
  code?: string;
  builtin?: boolean;
  is_active?: boolean;
  scope?: string;
  permissions?: string[];
};

export const roleKey = (role: Pick<CatalogRole, 'name' | 'code'> | string) => {
  if (typeof role === 'string') {
    return role;
  }
  return role.code || role.name;
};

export const catalogRoleLabel = (
  name: string | undefined,
  formatMessage: (desc: { id: string; defaultMessage?: string }) => string
) => {
  if (!name) {
    return formatMessage({ id: 'users.form.user' });
  }
  const key = BUILTIN_LABELS[name];
  if (key) {
    return formatMessage({ id: key });
  }
  return formatMessage({
    id: `roles.name.${name}`,
    defaultMessage: name
  });
};

export const sortCatalogRoles = <T extends CatalogRole>(roles: T[]): T[] => {
  const order: Record<string, number> = {
    [PLATFORM_ADMIN_ROLE]: 0,
    [PLATFORM_USER_ROLE]: 1
  };
  return [...roles].sort((a, b) => {
    const ao = a.builtin ? (order[roleKey(a)] ?? 2) : 10;
    const bo = b.builtin ? (order[roleKey(b)] ?? 2) : 10;
    if (ao !== bo) {
      return ao - bo;
    }
    return a.name.localeCompare(b.name);
  });
};
