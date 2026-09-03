import { createStyles } from 'antd-style';
import React from 'react';
import Sparkline from './sparkline';

const useStyles = createStyles(({ css }) => ({
  card: css`
    background: var(--console-bg-elevated);
    border: 1px solid var(--console-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: 16px 16px 14px;
    height: 108px;
    display: flex;
    flex-direction: column;
    min-width: 0;
    transition: border-color 120ms ease;

    &:hover {
      border-color: color-mix(
        in srgb,
        var(--console-border) 70%,
        var(--console-brand)
      );
    }
  `,
  top: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,
  label: css`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--console-text-secondary);
    min-width: 0;
  `,
  icon: css`
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-soft);
    color: var(--primary);
    font-size: 13px;
    flex-shrink: 0;
  `,
  valueRow: css`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
  `,
  valueBlock: css`
    min-width: 0;
  `,
  value: css`
    font-size: 26px;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.4px;
    color: var(--console-text);
    font-variant-numeric: tabular-nums;
    font-family: var(--console-font-numeric);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  hint: css`
    margin-top: 4px;
    font-size: 12px;
    color: var(--console-text-tertiary);
    display: flex;
    align-items: center;
    gap: 6px;
  `,
  deltaUp: css`
    color: var(--console-success);
  `,
  deltaDown: css`
    color: var(--console-danger);
  `
}));

const KpiCard: React.FC<{
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  delta?: React.ReactNode;
  deltaTone?: 'up' | 'down' | 'neutral';
  sparkline?: number[];
  sparkColor?: string;
}> = ({
  icon,
  label,
  value,
  hint,
  delta,
  deltaTone = 'neutral',
  sparkline,
  sparkColor
}) => {
  const { styles, cx } = useStyles();

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.label}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {label}
          </span>
        </div>
      </div>
      <div className={styles.valueRow}>
        <div className={styles.valueBlock}>
          <div className={styles.value}>{value}</div>
          {(hint || delta) && (
            <div className={styles.hint}>
              {hint}
              {delta && (
                <span
                  className={cx(
                    deltaTone === 'up' && styles.deltaUp,
                    deltaTone === 'down' && styles.deltaDown
                  )}
                >
                  {delta}
                </span>
              )}
            </div>
          )}
        </div>
        {sparkline && sparkline.length > 1 && (
          <Sparkline data={sparkline} color={sparkColor} />
        )}
      </div>
    </div>
  );
};

export default KpiCard;
