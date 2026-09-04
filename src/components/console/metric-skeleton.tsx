import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  list: css`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,
  row: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  meta: css`
    display: flex;
    justify-content: space-between;
    gap: 12px;
  `,
  bone: css`
    height: 10px;
    border-radius: 999px;
    background: var(--console-bg-muted);
  `
}));

const MetricSkeleton: React.FC<{
  rows?: number;
  style?: React.CSSProperties;
}> = ({ rows = 3, style }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.list} style={style}>
      {Array.from({ length: rows }).map((_, index) => (
        <div className={styles.row} key={index}>
          <div className={styles.meta}>
            <span
              className={styles.bone}
              style={{ width: `${42 + (index % 3) * 10}%`, height: 12 }}
            />
            <span className={styles.bone} style={{ width: 36, height: 12 }} />
          </div>
          <span className={styles.bone} style={{ width: '100%', height: 6 }} />
        </div>
      ))}
    </div>
  );
};

export default MetricSkeleton;
