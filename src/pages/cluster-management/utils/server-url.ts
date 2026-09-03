import { ServerUrlCandidate } from '../config/types';

const CUSTOM_VALUE = '__custom__';

export { CUSTOM_VALUE };

export type ServerUrlNetwork = 'private' | 'public';

export type RegistrationServerInfo = {
  server_url?: string;
  server_lan_url?: string | null;
  api_port?: number;
  server_url_candidates?: ServerUrlCandidate[];
};

/** Worker ``--server-url``: user pick, then LAN API from the token, then public. */
export const resolveWorkerServerUrl = (
  registrationInfo?: RegistrationServerInfo | null,
  selectedUrl?: string
) =>
  selectedUrl ||
  registrationInfo?.server_lan_url ||
  registrationInfo?.server_url ||
  '';

const isIPv4 = (host: string) =>
  /^(\d{1,3}\.){3}\d{1,3}$/.test(host) &&
  host.split('.').every((part) => {
    const n = Number(part);
    return n >= 0 && n <= 255;
  });

export const isPrivateHostname = (host: string) => {
  if (!host) return false;
  const hostname = host.toLowerCase();
  if (hostname === 'localhost' || hostname === 'localhost.localdomain') {
    return true;
  }
  if (!isIPv4(hostname)) {
    return false;
  }
  const [a, b] = hostname.split('.').map(Number);
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
};

export const buildLanUrl = (host: string, apiPort = 30080) => {
  if (apiPort === 80) {
    return `http://${host}`;
  }
  return `http://${host}:${apiPort}`;
};

/** Add the worker-facing API port when a private URL omits it. */
export const normalizeLanServerUrl = (url: string, apiPort = 30080) => {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return trimmed;
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed.includes('://') ? trimmed : `http://${trimmed}`);
  } catch {
    return trimmed;
  }
  if (!isPrivateHostname(parsed.hostname)) {
    return parsed.origin;
  }
  if (!parsed.port && apiPort && apiPort !== 80) {
    parsed.port = String(apiPort);
  }
  return parsed.origin;
};

const addCandidate = (
  map: Map<string, ServerUrlCandidate>,
  url?: string | null,
  kind?: ServerUrlCandidate['kind'],
  source = ''
) => {
  const normalized = (url || '').replace(/\/$/, '');
  if (!normalized || map.has(normalized)) {
    return;
  }
  const host = (() => {
    try {
      return new URL(normalized).hostname;
    } catch {
      return '';
    }
  })();
  map.set(normalized, {
    url: normalized,
    kind: kind || (isPrivateHostname(host) ? 'private' : 'public'),
    source
  });
};

export const mergeServerUrlCandidates = (
  registrationInfo?: RegistrationServerInfo | null
) => {
  const privateUrls = new Map<string, ServerUrlCandidate>();
  const publicUrls = new Map<string, ServerUrlCandidate>();
  const apiPort = registrationInfo?.api_port || 30080;

  const push = (candidate?: ServerUrlCandidate | null) => {
    if (!candidate?.url) return;
    const bucket =
      candidate.kind === 'private' ||
      isPrivateHostname(safeHostname(candidate.url))
        ? privateUrls
        : publicUrls;
    addCandidate(bucket, candidate.url, candidate.kind, candidate.source);
  };

  (registrationInfo?.server_url_candidates || []).forEach(push);
  if (registrationInfo?.server_lan_url) {
    push({
      url: registrationInfo.server_lan_url,
      kind: 'private',
      source: 'lan'
    });
  }
  if (registrationInfo?.server_url) {
    push({
      url: registrationInfo.server_url,
      kind: isPrivateHostname(safeHostname(registrationInfo.server_url))
        ? 'private'
        : 'public',
      source: 'token'
    });
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (isPrivateHostname(host)) {
      addCandidate(
        privateUrls,
        buildLanUrl(host, apiPort),
        'private',
        'browser'
      );
    } else if (host && host !== 'localhost') {
      addCandidate(
        publicUrls,
        window.location.origin.replace(/\/$/, ''),
        'public',
        'browser'
      );
    }
  }

  return {
    private: Array.from(privateUrls.values()),
    public: Array.from(publicUrls.values()),
    apiPort
  };
};

const safeHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

export const defaultServerUrlConfig = (
  registrationInfo?: RegistrationServerInfo | null
) => {
  const merged = mergeServerUrlCandidates(registrationInfo);
  const network: ServerUrlNetwork = merged.private.length
    ? 'private'
    : merged.public.length
      ? 'public'
      : 'private';
  const first =
    network === 'private'
      ? registrationInfo?.server_lan_url || merged.private[0]?.url
      : merged.public[0]?.url;
  const url =
    network === 'private'
      ? normalizeLanServerUrl(first || '', merged.apiPort)
      : first || '';
  return {
    network,
    url,
    custom: !first
  };
};
