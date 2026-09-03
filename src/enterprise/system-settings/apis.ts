import { request } from '@umijs/max';

export const SYSTEM_SETTINGS_API = '/system-settings';
export const BILLING_SETTINGS_API = '/billing/settings';

export type SystemSettings = {
  base_currency: string;
};

export async function querySystemSettings() {
  return request<SystemSettings>(SYSTEM_SETTINGS_API, { method: 'GET' });
}

export async function updateSystemSettings(data: SystemSettings) {
  return request<SystemSettings>(SYSTEM_SETTINGS_API, {
    method: 'PUT',
    data
  });
}

export async function queryBillingSettings() {
  return request<SystemSettings>(BILLING_SETTINGS_API, { method: 'GET' });
}
