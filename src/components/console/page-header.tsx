import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  wrap: css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    min-width: 0;
  `,
  row: css`
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
  `,
  title: css`
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.2px;
    line-height: 24px;
    color: var(--text-primary);
    white-space: nowrap;
  `,
  extra: css`
    display: inline-flex;
    align-items: center;
    min-width: 0;
  `,
  subtitle: css`
    font-size: 13px;
    font-weight: 400;
    line-height: 18px;
    color: var(--text-muted);
  `
}));

const PageHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
}> = ({ title, subtitle, extra }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={styles.title}>{title}</span>
        {extra && <span className={styles.extra}>{extra}</span>}
      </div>
      {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
    </div>
  );
};

export default PageHeader;
