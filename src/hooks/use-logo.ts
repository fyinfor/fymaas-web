import BrandLogo from '@/assets/images/brand-logo.png';
import useUserSettings from '@/hooks/use-user-settings';
import { getGPUStackPlugin } from '@/plugins';

export const DEFAULT_SIDEBAR_LOGO = BrandLogo;
export const DEFAULT_MINI_LOGO = BrandLogo;

const useLogo = () => {
  const { isDarkTheme, userSettings } = useUserSettings();

  const enterprisePlugin = getGPUStackPlugin();
  const resolved =
    enterprisePlugin?.branding?.resolveLogos?.(userSettings, isDarkTheme) ?? {};

  return {
    sidebarLogo: resolved.sidebarLogo || DEFAULT_SIDEBAR_LOGO,
    miniLogo: resolved.miniLogo || DEFAULT_MINI_LOGO
  };
};

export { useLogo };
