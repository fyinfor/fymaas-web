import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  chip: css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: var(--console-bg-muted);
    color: var(--console-text-secondary);
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    white-space: nowrap;
    max-width: 100%;
  `
}));

const MetaChip: React.FC<{
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, icon, className, style }) => {
  const { styles, cx } = useStyles();
  return (
    <span className={cx(styles.chip, className)} style={style}>
      {icon}
      {children}
    </span>
  );
};

export default MetaChip;
