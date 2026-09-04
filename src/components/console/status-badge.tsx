import { Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const toneVar: Record<StatusTone, { color: string; bg: string }> = {
  success: {
    color: 'var(--console-success)',
    bg: 'var(--console-success-soft)'
  },
  info: {
    color: 'var(--primary-hover)',
    bg: 'var(--primary-soft)'
  },
  warning: {
    color: 'var(--console-warning)',
    bg: 'var(--console-warning-soft)'
  },
  danger: {
    color: 'var(--console-danger)',
    bg: 'var(--console-danger-soft)'
  },
  neutral: {
    color: 'var(--console-text-secondary)',
    bg: 'var(--console-bg-muted)'
  }
};

const useStyles = createStyles(({ css }) => ({
  badge: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    background: var(--badge-bg);
    color: var(--badge-color);
    white-space: nowrap;
  `,
  plain: css`
    height: auto;
    padding: 0;
    border-radius: 0;
    background: transparent;
    font-size: 13px;
  `,
  dot: css`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  `
}));

const StatusBadge: React.FC<{
  tone?: StatusTone;
  plain?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ tone = 'neutral', plain, title, children }) => {
  const { styles, cx } = useStyles();
  const vars = toneVar[tone];

  const badge = (
    <span
      className={cx(styles.badge, plain && styles.plain)}
      style={
        {
          '--badge-bg': vars.bg,
          '--badge-color': vars.color
        } as React.CSSProperties
      }
    >
      <span className={styles.dot} />
      {children || null}
    </span>
  );

  return title ? <Tooltip title={title}>{badge}</Tooltip> : badge;
};

export default StatusBadge;
