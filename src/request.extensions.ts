// Identity hook for build-time request-interceptor extensions. Tooling
// may overwrite this file to inject extra interceptors (e.g. context
// headers); the original is restored on cleanup. Mirrors
// `src/access.extensions.ts` and `config/routes.extensions.ts`.
//
// Each interceptor follows the umi/max signature: it receives
// `(url, options)` and returns `{ url, options }` — typed loosely
// here so this file has no dependency on the framework's exact
// option types.
import { nsLocal } from '@gpustack/core-ui/utils';

export type RequestInterceptor = (
  url: string,
  options: Record<string, any>
) => { url: string; options: Record<string, any> };

const readCurrentWorkspaceId = (): number | null => {
  try {
    const raw =
      nsLocal.get('currentWorkspaceId') || nsLocal.get('currentOrganizationId');
    if (!raw) return null;
    const value = JSON.parse(raw);
    return typeof value === 'number' && value > 0 ? value : null;
  } catch {
    return null;
  }
};

export const getTenantHeaders = (_method?: string): Record<string, string> => {
  const workspaceId = readCurrentWorkspaceId();
  if (workspaceId == null) return {};
  return {
    'X-Workspace-Id': String(workspaceId),
    'X-Organization-Id': String(workspaceId)
  };
};

export const extraRequestInterceptors: RequestInterceptor[] = [
  (url, options) => {
    const headers = getTenantHeaders();
    if (!Object.keys(headers).length) return { url, options };
    return {
      url,
      options: {
        ...options,
        headers: { ...(options.headers || {}), ...headers }
      }
    };
  }
];

export type ResponseInterceptor = (response: any) => any;

export const extraResponseInterceptors: ResponseInterceptor[] = [];
