import { getBranding } from '@/enterprise/branding/runtime';
import React from 'react';

const Background: React.FC<{ isDarkTheme: boolean }> = ({ isDarkTheme }) => {
  const customBackground = getBranding().login_background_url;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        minHeight: '100vh',
        zIndex: -1,
        background: customBackground
          ? `url("${encodeURI(customBackground)}") center no-repeat`
          : isDarkTheme
            ? `radial-gradient(at 50% 20%, #383838 0%, #292929 40%, #000 100%)`
            : `radial-gradient(1200px 480px at 18% -10%, rgba(0, 82, 217, 0.14), transparent 58%),
             radial-gradient(900px 420px at 90% 8%, rgba(34, 211, 238, 0.12), transparent 52%),
             #f5f7fa`,
        backgroundSize: customBackground
          ? 'cover'
          : isDarkTheme
            ? 'contain'
            : 'auto',
        opacity: 1
      }}
    ></div>
  );
};

export default Background;
