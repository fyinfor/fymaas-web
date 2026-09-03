import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  wrap: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 88px;
    width: 100%;
  `,
  meta: css`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    font-variant-numeric: tabular-nums;
    font-family: var(--console-font-numeric);
  `,
  value: css`
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
  `,
  detail: css`
    font-size: 12px;
    color: var(--text-muted);
  `,
  bar: css`
    height: 6px;
    border-radius: 999px;
    background: var(--bg-hover);
    overflow: hidden;
  `,
  fill: css`
    height: 100%;
    border-radius: inherit;
  `
}));

const ResourceBar: React.FC<{
  percent?: number | null;
  color?: string;
  detail?: React.ReactNode;
}> = ({ percent, color = 'var(--gpu)', detail }) => {
  const { styles } = useStyles();
  if (percent === null || percent === undefined || Number.isNaN(percent)) {
    return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  }
  const width = Math.max(0, Math.min(100, percent));

  return (
    <div className={styles.wrap}>
      <div className={styles.meta}>
        <span className={styles.value}>{Math.round(width)}%</span>
        {detail && <span className={styles.detail}>{detail}</span>}
      </div>
      <div className={styles.bar}>
        <div
          className={styles.fill}
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
};

export default ResourceBar;
