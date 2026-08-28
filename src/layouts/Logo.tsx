import TokeaseMark from '@/assets/images/tokease-mark.svg';
import {
  DEFAULT_MINI_LOGO,
  DEFAULT_SIDEBAR_LOGO,
  useLogo
} from '@/hooks/use-logo';
import React from 'react';
import styled from 'styled-components';

const Brand = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  line-height: 1;
`;

const Wordmark = styled.span`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--ant-color-text);
`;

const TokeaseMarkIcon: React.FC<{ height?: number }> = ({ height = 24 }) => (
  <img src={TokeaseMark} alt="" style={{ height, width: height }} />
);

const LogoIcon: React.FC = () => {
  const { sidebarLogo } = useLogo();

  if (sidebarLogo !== DEFAULT_SIDEBAR_LOGO) {
    return <img src={sidebarLogo} alt="Tokease" style={{ height: 24 }} />;
  }

  return (
    <Brand>
      <TokeaseMarkIcon />
      <Wordmark>Tokease</Wordmark>
    </Brand>
  );
};

const SLogoIcon: React.FC = () => {
  const { miniLogo } = useLogo();

  if (miniLogo !== DEFAULT_MINI_LOGO) {
    return <img src={miniLogo} alt="Tokease" style={{ height: 24 }} />;
  }

  return <TokeaseMarkIcon />;
};

export { LogoIcon, SLogoIcon };
