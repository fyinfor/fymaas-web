import { Empty } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';

export interface RankListItem {
  key: string;
  name: React.ReactNode;
  value: React.ReactNode;
  percent: number;
  extra?: React.ReactNode;
}

const useStyles = createStyles(({ css }) => ({
  list: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  row: css`
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
  `,
  rank: css`
    font-size: 12px;
    color: var(--console-text-tertiary);
    font-variant-numeric: tabular-nums;
    text-align: right;
  `,
  body: css`
    min-width: 0;
  `,
  nameRow: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  `,
  name: css`
    font-size: 13px;
    color: var(--console-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  value: css`
    font-size: 12px;
    color: var(--console-text-secondary);
    font-variant-numeric: tabular-nums;
    font-family: var(--console-font-numeric);
    flex-shrink: 0;
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
  `,
  extra: css`
    font-size: 12px;
    color: var(--console-text-tertiary);
    font-variant-numeric: tabular-nums;
    min-width: 36px;
    text-align: right;
  `,
  empty: css`
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
  `
}));

const RankList: React.FC<{
  items: RankListItem[];
  color?: string;
}> = ({ items, color = 'var(--console-brand)' }) => {
  const { styles } = useStyles();

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item, index) => (
        <div className={styles.row} key={item.key}>
          <span className={styles.rank}>{index + 1}</span>
          <div className={styles.body}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.value}>{item.value}</span>
            </div>
            <div className={styles.bar}>
              <div
                className={styles.fill}
                style={{
                  width: `${Math.max(0, Math.min(100, item.percent))}%`,
                  background: color
                }}
              />
            </div>
          </div>
          {item.extra !== undefined && (
            <span className={styles.extra}>{item.extra}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default RankList;
