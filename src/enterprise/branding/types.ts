export type BrandingAssetKind =
  | 'logo_light'
  | 'logo_dark'
  | 'mini_logo'
  | 'favicon'
  | 'login_background';

/** Writable branding fields. `null` clears a field; omitting it leaves
 * the stored value alone. */
export interface BrandingConfig {
  product_name?: string | null;
  color_primary?: string | null;
  login_title?: string | null;
  login_subtitle?: string | null;
  doc_url?: string | null;
  support_url?: string | null;
  contact_url?: string | null;
  custom_domain?: string | null;
}

/** Branding as served by the API, with the uploaded images resolved to
 * URLs. A `null` URL means nothing was uploaded for that kind and the
 * bundled default should be kept. */
export interface BrandingPublic extends BrandingConfig {
  logo_light_url?: string | null;
  logo_dark_url?: string | null;
  mini_logo_url?: string | null;
  favicon_url?: string | null;
  login_background_url?: string | null;
}

export const BRANDING_ASSET_KINDS: BrandingAssetKind[] = [
  'logo_light',
  'logo_dark',
  'mini_logo',
  'favicon',
  'login_background'
];

/** Which field on `BrandingPublic` carries each asset's URL. */
export const ASSET_URL_FIELD: Record<BrandingAssetKind, keyof BrandingPublic> =
  {
    logo_light: 'logo_light_url',
    logo_dark: 'logo_dark_url',
    mini_logo: 'mini_logo_url',
    favicon: 'favicon_url',
    login_background: 'login_background_url'
  };
