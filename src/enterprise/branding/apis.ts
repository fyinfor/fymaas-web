import { request } from '@umijs/max';
import type {
  BrandingAssetKind,
  BrandingConfig,
  BrandingPublic
} from './types';

// Reads are unauthenticated (the login page needs them) but still live
// under the versioned prefix, so the default baseURL applies to every
// call here -- see the mount comment in the server's routes/routes.py.
export const BRANDING_API = '/branding';

export async function queryBranding() {
  return request<BrandingPublic>(BRANDING_API, {
    method: 'GET',
    // Called during app boot, before anyone is signed in. A failure is
    // recoverable (we fall back to the bundled defaults), so it must not
    // raise a toast on the login screen.
    skipErrorHandler: true
  });
}

export async function updateBranding(data: BrandingConfig) {
  return request<BrandingPublic>(BRANDING_API, {
    method: 'PUT',
    data
  });
}

export async function uploadBrandingAsset(kind: BrandingAssetKind, file: File) {
  const data = new FormData();
  data.append('file', file);
  return request<BrandingPublic>(`${BRANDING_API}/assets/${kind}`, {
    method: 'POST',
    data,
    requestType: 'form'
  });
}

export async function deleteBrandingAsset(kind: BrandingAssetKind) {
  return request<BrandingPublic>(`${BRANDING_API}/assets/${kind}`, {
    method: 'DELETE'
  });
}
