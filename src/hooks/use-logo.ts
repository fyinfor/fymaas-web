import TokeaseLogo from '@/assets/images/tokease-logo.svg';
import TokeaseMark from '@/assets/images/tokease-mark.svg';
import useUserSettings from '@/hooks/use-user-settings';
import { getGPUStackPlugin } from '@/plugins';

export const DEFAULT_SIDEBAR_LOGO = TokeaseLogo;
export const DEFAULT_MINI_LOGO = TokeaseMark;

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
