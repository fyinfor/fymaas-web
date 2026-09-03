import { request } from '@umijs/max';

export const LDAP_API = '/ldap';

export type LdapSettings = {
  server_uri?: string | null;
  bind_dn?: string | null;
  bind_password_set?: boolean;
  search_base?: string | null;
  user_filter?: string;
  username_attribute?: string;
  display_name_attribute?: string;
  email_attribute?: string;
  group_attribute?: string;
  configured?: boolean;
};

export type LdapSettingsUpdate = {
  server_uri?: string | null;
  bind_dn?: string | null;
  bind_password?: string | null;
  search_base?: string | null;
  user_filter?: string | null;
  username_attribute?: string | null;
  display_name_attribute?: string | null;
  email_attribute?: string | null;
  group_attribute?: string | null;
};

export async function queryLdapSettings() {
  return request<LdapSettings>(LDAP_API, { method: 'GET' });
}

export async function updateLdapSettings(data: LdapSettingsUpdate) {
  return request<LdapSettings>(LDAP_API, { method: 'PUT', data });
}

export async function testLdapSettings() {
  return request<{ ok: boolean }>(`${LDAP_API}/test`, { method: 'POST' });
}
