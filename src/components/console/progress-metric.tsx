import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  row: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  meta: css`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  `,
  label: css`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--console-text);
  `,
  swatch: css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  `,
  value: css`
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    font-family: var(--console-font-numeric);
    color: var(--console-text);
  `,
  bar: css`
    height: 6px;
    border-radius: 999px;
    background: var(--console-bg-muted);
    overflow: hidden;
  `,
  fill: css`
    height: 100%;
    border-radius: inherit;
    transition: width 160ms ease;
  `,
  detail: css`
    font-size: 12px;
    color: var(--console-text-tertiary);
    font-variant-numeric: tabular-nums;
  `
}));

const ProgressMetric: React.FC<{
  label: React.ReactNode;
  percent?: number | null;
  detail?: React.ReactNode;
  color?: string;
}> = ({ label, percent, detail, color = 'var(--console-chart-gpu)' }) => {
  const { styles } = useStyles();
  const empty =
    percent === null || percent === undefined || Number.isNaN(percent);
  const width = empty ? 0 : Math.max(0, Math.min(100, percent));

  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <span className={styles.label}>
          <span className={styles.swatch} style={{ background: color }} />
          {label}
        </span>
        <span className={styles.value}>
          {empty ? '—' : `${Math.round(width)}%`}
        </span>
      </div>
      <div className={styles.bar}>
        {!empty && (
          <div
            className={styles.fill}
            style={{ width: `${width}%`, background: color }}
          />
        )}
      </div>
      {detail && <div className={styles.detail}>{detail}</div>}
    </div>
  );
};

export default ProgressMetric;
