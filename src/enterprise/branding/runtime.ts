/**
 * Applying branding to the running document.
 *
 * The active configuration is kept in a module variable rather than in a
 * store, because the one consumer that cannot use a hook -- the plugin's
 * `resolveLogos`, which the host calls as a plain function -- has to read
 * it synchronously. It is written once during app boot and only changes
 * when an admin saves the settings page, which reloads afterwards.
 */
import type { BrandingPublic } from './types';

/** Product name baked into the bundle (`config.title` and the sidebar
 * wordmark). Used as the needle when rewriting titles. */
export const DEFAULT_PRODUCT_NAME = 'Tokease';

let current: BrandingPublic = {};

export const getBranding = (): BrandingPublic => current;

export const setBranding = (branding?: BrandingPublic | null): void => {
  current = branding ?? {};
};

/** The name to show wherever the product refers to itself. */
export const getProductName = (): string =>
  getBranding().product_name || DEFAULT_PRODUCT_NAME;

const applyDocumentTitle = (productName?: string | null): void => {
  if (!productName || productName === DEFAULT_PRODUCT_NAME) {
    return;
  }

  const rewrite = () => {
    if (document.title.includes(DEFAULT_PRODUCT_NAME)) {
      document.title = document.title
        .split(DEFAULT_PRODUCT_NAME)
        .join(productName);
    }
  };

  rewrite();

  // umi's title plugin rewrites document.title on every route change, so
  // the assignment above would only survive until the first navigation.
  // Watching the <title> element re-applies the custom name after each
  // rewrite without having to hook into the router. This cannot loop:
  // the rewritten title no longer contains the default name, so the
  // observation it triggers is a no-op.
  const titleElement = document.querySelector('title');
  if (titleElement) {
    new MutationObserver(rewrite).observe(titleElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
};

const applyFavicon = (url?: string | null): void => {
  if (!url) {
    return;
  }
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
};

export const applyDocumentBranding = (branding: BrandingPublic): void => {
  applyDocumentTitle(branding.product_name);
  applyFavicon(branding.favicon_url);
};
