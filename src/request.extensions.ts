// Identity hook for build-time request-interceptor extensions. Tooling
// may overwrite this file to inject extra interceptors (e.g. context
// headers); the original is restored on cleanup. Mirrors
// `src/access.extensions.ts` and `config/routes.extensions.ts`.
//
// Each interceptor follows the umi/max signature: it receives
// `(url, options)` and returns `{ url, options }` — typed loosely
// here so this file has no dependency on the framework's exact
// option types.
import {
  persistWorkspaceSelection,
  pickFallbackWorkspaceId,
  readCurrentWorkspaceId
} from '@/enterprise/workspace-storage';

export type RequestInterceptor = (
  url: string,
  options: Record<string, any>
) => { url: string; options: Record<string, any> };

export type TenantHeaderInput = {
  url?: string;
  method?: string;
};

// Membership / identity bootstraps must not carry a stale act-as header.
// `/users/me/workspaces` is how we discover a valid id after login; if
// that call 404s on the leftover workspace, selection can never recover.
const SKIP_TENANT_HEADER = [
  /\/auth(?:\/|$|\?)/,
  /\/users\/me(?:\/|$|\?)/,
  /\/roles\/me(?:\/|$|\?)/
];

const pathOf = (url?: string): string => {
  if (!url) return '';
  try {
    return url.startsWith('http') ? new URL(url).pathname : url;
  } catch {
    return url;
  }
};

const shouldSkipTenantHeaders = (url?: string): boolean => {
  const path = pathOf(url);
  return SKIP_TENANT_HEADER.some((pattern) => pattern.test(path));
};

const errorMessageOf = (errorLike: any): string => {
  const data =
    errorLike?.response?.data ??
    errorLike?.data ??
    errorLike?.error ??
    errorLike;
  return String(
    data?.error?.message || data?.message || errorLike?.message || ''
  );
};

const statusOf = (errorLike: any): number | undefined =>
  errorLike?.response?.status ?? errorLike?.status ?? errorLike?.data?.code;

const missingWorkspaceId = (errorLike: any): number | null => {
  if (statusOf(errorLike) !== 404) return null;
  const match =
    /Workspace (\d+) not found/i.exec(errorMessageOf(errorLike)) ||
    /Organization or workspace (\d+) not found/i.exec(
      errorMessageOf(errorLike)
    );
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) ? id : null;
};

let recoveringWorkspace = false;

/** Drop a vanished workspace id and reload once so the next boot
 * lands on a workspace the caller still belongs to. */
export const recoverMissingWorkspace = (errorLike: any): boolean => {
  const staleId = missingWorkspaceId(errorLike);
  if (staleId == null) return false;
  const current = readCurrentWorkspaceId();
  if (current != null && current !== staleId) return false;
  if (recoveringWorkspace) return true;
  recoveringWorkspace = true;
  persistWorkspaceSelection(pickFallbackWorkspaceId(staleId));
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
  return true;
};

export const isMissingWorkspaceError = (errorLike: any): boolean =>
  missingWorkspaceId(errorLike) != null;

export const getTenantHeaders = (
  input?: TenantHeaderInput | string
): Record<string, string> => {
  const url = typeof input === 'string' ? undefined : input?.url;
  if (shouldSkipTenantHeaders(url)) return {};
  const workspaceId = readCurrentWorkspaceId();
  if (workspaceId == null) return {};
  return {
    'X-Workspace-Id': String(workspaceId),
    'X-Organization-Id': String(workspaceId)
  };
};

export const extraRequestInterceptors: RequestInterceptor[] = [
  (url, options) => {
    const headers = getTenantHeaders({ url, method: options?.method });
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

export const extraResponseInterceptors: ResponseInterceptor[] = [
  (response) => {
    const status = response?.status ?? response?.response?.status;
    if (status === 404) {
      recoverMissingWorkspace(response);
    }
    return response;
  }
];
