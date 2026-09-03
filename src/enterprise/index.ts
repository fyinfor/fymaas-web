/**
 * fymaas enterprise capabilities.
 *
 * Everything here is fymaas' own addition on top of the upstream
 * gpustack-ui tree. It is delivered through the plugin seam upstream
 * already provides (`src/plugins/`) rather than by editing host files,
 * which keeps the diff against upstream to this directory plus the
 * one-line registration in `src/global.tsx`.
 */
import { GPUStackPluginManager } from '@/plugins/manager';
import type { AppPlugin } from '@/plugins/types';
import { queryBranding } from './branding/apis';
import {
  applyDocumentBranding,
  getBranding,
  setBranding
} from './branding/runtime';

const enterprisePlugin: AppPlugin = {
  async onAppInit(context) {
    let branding;
    try {
      branding = await queryBranding();
    } catch (error) {
      // Branding is cosmetic. Failing to load it must not keep the app
      // from booting -- the bundled defaults are a complete fallback.
      console.error('Failed to load branding:', error);
      return {};
    }

    setBranding(branding);
    // Feeds `useUserSettings`, whose themeData reads
    // `userSettings.colorPrimary`. Passing the bundled default back when
    // nothing is configured matters: the value is persisted to
    // localStorage, so a previously customised colour would otherwise
    // survive being cleared.
    context.setUserSettings?.({
      colorPrimary: branding.color_primary || context.defaultColorPrimary
    });
    applyDocumentBranding(branding);

    return { branding };
  },

  // The login page builds its own ConfigProvider instead of going
  // through `useUserSettings`, and asks the plugin for the colour.
  getPrimaryColor: (userSettings: any) => ({
    colorPrimary: getBranding().color_primary || userSettings?.colorPrimary
  }),

  branding: {
    resolveLogos: (_userSettings, isDarkTheme) => {
      const config = getBranding();
      // Fall back to the light logo in dark mode: a customer who only
      // uploads one should see it in both themes rather than losing
      // their logo whenever the theme flips.
      const sidebarLogo = isDarkTheme
        ? config.logo_dark_url || config.logo_light_url
        : config.logo_light_url;

      return {
        sidebarLogo: sidebarLogo || undefined,
        miniLogo: config.mini_logo_url || undefined
      };
    }
  }
};

export const registerEnterprisePlugin = (): void => {
  GPUStackPluginManager.register('enterprise', enterprisePlugin);
};
