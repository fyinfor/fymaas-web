import BrandLogo from '@/assets/images/brand-logo.png';
import { getProductName } from '@/enterprise/branding/runtime';
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
  height: 28px;
  line-height: 1;
`;

const Wordmark = styled.span`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--ant-color-text);
`;

const BrandMark: React.FC<{ height?: number; alt?: string }> = ({
  height = 28,
  alt = ''
}) => (
  <img
    src={BrandLogo}
    alt={alt}
    style={{
      height,
      width: height,
      borderRadius: '50%',
      objectFit: 'cover',
      display: 'block'
    }}
  />
);

const LogoIcon: React.FC = () => {
  const { sidebarLogo } = useLogo();
  const productName = getProductName();

  if (sidebarLogo !== DEFAULT_SIDEBAR_LOGO) {
    return <img src={sidebarLogo} alt={productName} style={{ height: 28 }} />;
  }

  return (
    <Brand>
      <BrandMark />
      <Wordmark>{productName}</Wordmark>
    </Brand>
  );
};

const SLogoIcon: React.FC = () => {
  const { miniLogo } = useLogo();

  if (miniLogo !== DEFAULT_MINI_LOGO) {
    return <img src={miniLogo} alt={getProductName()} style={{ height: 28 }} />;
  }

  return <BrandMark />;
};

export { LogoIcon, SLogoIcon };
