import { request } from '@umijs/max';

export const SYSTEM_SETTINGS_API = '/system-settings';
export const BILLING_SETTINGS_API = '/billing/settings';
export const SYNC_OFFICIAL_CATALOG_API =
  '/system-settings/sync-official-catalog';

export type CatalogLastSync = {
  source?: string;
  created?: number;
  updated?: number;
  skipped?: number;
  skipped_not_in_catalog?: number;
  total_in_source?: number;
  providers_touched?: number;
  applied_plan_items?: number;
  errors?: string[];
  synced_at?: string;
};

export type SystemSettings = {
  base_currency: string;
  fx_cny_per_usd?: string | number;
  catalog_source?: string;
  catalog_provider_slugs?: string;
  catalog_priced_only?: boolean;
  catalog_import_new?: boolean;
  catalog_apply_default_plan?: boolean;
  catalog_last_sync?: CatalogLastSync | null;
};

export type OfficialCatalogSyncPayload = {
  source?: string;
  provider_slugs?: string[];
  priced_only?: boolean;
  import_new?: boolean;
  apply_default_plan?: boolean;
};

export async function querySystemSettings() {
  return request<SystemSettings>(SYSTEM_SETTINGS_API, { method: 'GET' });
}

export async function updateSystemSettings(data: Partial<SystemSettings>) {
  return request<SystemSettings>(SYSTEM_SETTINGS_API, {
    method: 'PUT',
    data
  });
}

export async function syncOfficialCatalog(data?: OfficialCatalogSyncPayload) {
  return request<CatalogLastSync>(SYNC_OFFICIAL_CATALOG_API, {
    method: 'POST',
    data: data || {}
  });
}

export async function queryBillingSettings() {
  return request<SystemSettings>(BILLING_SETTINGS_API, { method: 'GET' });
}
