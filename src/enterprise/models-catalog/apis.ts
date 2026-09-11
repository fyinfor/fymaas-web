import { request } from '@umijs/max';

export const MODELS_CATALOG_SETTINGS_API = '/models-catalog-settings';
export const PUBLIC_SITE_CONFIG_API = '/public/site-config';

export type ModelsCatalogSettings = {
  public_enabled: boolean;
  ready_only: boolean;
  public_access_only: boolean;
  api_endpoint: string;
  api_docs_url: string;
  public_models_path: string;
  compat_models_path: string;
};

export type ModelsCatalogSettingsUpdate = {
  public_enabled?: boolean;
  ready_only?: boolean;
  public_access_only?: boolean;
  api_endpoint?: string | null;
  api_docs_url?: string | null;
};

export type PublicSiteConfig = {
  api_endpoint: string;
  api_docs_url: string;
  public_catalog_enabled: boolean;
  public_models_path: string;
  compat_models_path: string;
};

export async function queryModelsCatalogSettings() {
  return request<ModelsCatalogSettings>(MODELS_CATALOG_SETTINGS_API, {
    method: 'GET'
  });
}

export async function updateModelsCatalogSettings(
  data: ModelsCatalogSettingsUpdate
) {
  return request<ModelsCatalogSettings>(MODELS_CATALOG_SETTINGS_API, {
    method: 'PUT',
    data
  });
}

export async function queryPublicSiteConfig() {
  return request<PublicSiteConfig>(PUBLIC_SITE_CONFIG_API, {
    method: 'GET'
  });
}

export function resolveApiOrigin(
  apiEndpoint?: string | null,
  fallbackOrigin?: string
) {
  const fallback =
    fallbackOrigin ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const raw = (apiEndpoint || '').trim().replace(/\/+$/, '');
  if (!raw) return fallback;
  if (raw.toLowerCase().endsWith('/v1')) {
    return raw.slice(0, -3) || fallback;
  }
  return raw;
}
