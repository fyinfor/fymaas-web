import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  wrap: css`
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--console-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--console-bg-elevated);
  `,
  head: css`
    display: grid;
    gap: 16px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--console-border);
    background: var(--console-bg-muted);
  `,
  row: css`
    display: grid;
    gap: 16px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--console-divider);

    &:last-child {
      border-bottom: none;
    }
  `,
  bone: css`
    height: 12px;
    border-radius: 999px;
    background: var(--console-bg-muted);
  `
}));

const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 5 }) => {
  const { styles } = useStyles();
  const template = `repeat(${columns}, minmax(0, 1fr))`;
  return (
    <div className={styles.wrap}>
      <div className={styles.head} style={{ gridTemplateColumns: template }}>
        {Array.from({ length: columns }).map((_, index) => (
          <span
            className={styles.bone}
            key={`h-${index}`}
            style={{ width: `${48 + (index % 2) * 16}%`, height: 10 }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          className={styles.row}
          key={row}
          style={{ gridTemplateColumns: template }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <span
              className={styles.bone}
              key={`${row}-${col}`}
              style={{ width: `${56 + ((row + col) % 3) * 12}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
