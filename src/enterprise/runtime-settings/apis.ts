import { request } from '@umijs/max';

export const RUNTIME_SETTINGS_API = '/runtime-settings';

export type RuntimeOverlay = {
  system_default_container_registry?: string | null;
  image_repo?: string | null;
  image_name_override?: string | null;
  operator_image?: string | null;
  namespace?: string | null;
  gateway_namespace?: string | null;
  benchmark_image_repo?: string | null;
  tools_download_base_url?: string | null;
  runtime_container_namespace?: string | null;
};

export type RuntimeSource = 'settings' | 'cli' | 'default';

export type RuntimeFieldSources = Record<keyof RuntimeOverlay, RuntimeSource>;

export type RuntimePreview = {
  worker_image: string;
  runtime_pause: string;
  runner_example: string;
  operator_image: string;
};

export type RuntimeSettings = {
  overlay: RuntimeOverlay;
  effective: RuntimeOverlay;
  sources: RuntimeFieldSources;
  preview: RuntimePreview;
};

export async function queryRuntimeSettings() {
  return request<RuntimeSettings>(RUNTIME_SETTINGS_API, { method: 'GET' });
}

export async function updateRuntimeSettings(data: RuntimeOverlay) {
  return request<RuntimeSettings>(RUNTIME_SETTINGS_API, {
    method: 'PUT',
    data
  });
}
