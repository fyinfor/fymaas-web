export const UserRoles = {
  ADMIN: 'admin',
  USER: 'user'
};

export const UserRolesOptions = [
  { label: 'users.form.admin', value: UserRoles.ADMIN },
  { label: 'users.form.user', value: UserRoles.USER }
];

export const AuthSources = {
  LOCAL: 'Local',
  OIDC: 'OIDC',
  SAML: 'SAML',
  CAS: 'CAS'
};

const pickChars = (alphabet: string, count: number): string[] => {
  const out: string[] = [];
  const bytes = new Uint32Array(count);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < count; i += 1) {
    out.push(alphabet[bytes[i] % alphabet.length]);
  }
  return out;
};

const shuffleChars = (items: string[]): string[] => {
  const bytes = new Uint32Array(items.length);
  crypto.getRandomValues(bytes);
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = bytes[i] % (i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

/** 12-char local password that satisfies `PasswordReg`. */
export const generateLocalPassword = (length = 12): string => {
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digit = '23456789';
  const special = '!@#$%^&*_+.';
  const all = `${lower}${upper}${digit}${special}`;
  return shuffleChars([
    ...pickChars(lower, 1),
    ...pickChars(upper, 1),
    ...pickChars(digit, 1),
    ...pickChars(special, 1),
    ...pickChars(all, Math.max(0, length - 4))
  ]).join('');
};

export const formatAuthSourceLabel = (
  source: string | undefined,
  formatMessage: (desc: { id: string }) => string
): string => {
  if (!source || source === AuthSources.LOCAL) {
    return formatMessage({ id: 'users.form.source.local' });
  }
  return source;
};
