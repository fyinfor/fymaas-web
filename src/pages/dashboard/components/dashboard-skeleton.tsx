import { MetricSkeleton, TableSkeleton } from '@/components/console';
import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  page: css`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  health: css`
    height: 52px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--console-border);
    background: var(--console-bg-elevated);
    box-shadow: var(--shadow-card);
  `,
  kpis: css`
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1280px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  `,
  card: css`
    height: 108px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--console-border);
    background: var(--console-bg-elevated);
    box-shadow: var(--shadow-card);
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  chart: css`
    min-height: 220px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--console-border);
    background: var(--console-bg-elevated);
    box-shadow: var(--shadow-card);
    padding: 16px;
  `,
  split: css`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 16px;

    @media (max-width: 1280px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `,
  bone: css`
    height: 12px;
    border-radius: 999px;
    background: var(--console-bg-muted);
  `
}));

const DashboardSkeleton: React.FC = () => {
  const { styles } = useStyles();
  return (
    <div className={styles.page}>
      <div className={styles.health} />
      <div className={styles.kpis}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div className={styles.card} key={index}>
            <span className={styles.bone} style={{ width: '46%' }} />
            <span
              className={styles.bone}
              style={{ width: '32%', height: 22 }}
            />
          </div>
        ))}
      </div>
      <div className={styles.chart}>
        <span
          className={styles.bone}
          style={{ width: 120, marginBottom: 16 }}
        />
        <MetricSkeleton rows={4} />
      </div>
      <div className={styles.split}>
        <div className={styles.chart}>
          <MetricSkeleton rows={4} />
        </div>
        <div className={styles.chart}>
          <MetricSkeleton rows={4} />
        </div>
      </div>
      <TableSkeleton rows={4} columns={6} />
      <div className={styles.split}>
        <div className={styles.chart}>
          <MetricSkeleton rows={5} />
        </div>
        <div className={styles.chart}>
          <MetricSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
