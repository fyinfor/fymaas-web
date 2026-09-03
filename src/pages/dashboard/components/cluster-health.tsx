import { StatusBadge } from '@/components/console';
import { useIntl } from '@umijs/max';
import { createStyles } from 'antd-style';
import { useContext } from 'react';
import { DashboardContext } from '../config/dashboard-context';

const useStyles = createStyles(({ css }) => ({
  bar: css`
    display: flex;
    align-items: center;
    gap: 0;
    height: 52px;
    padding: 0 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    overflow: auto hidden;
  `,
  item: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 14px;
    font-size: 13px;
    white-space: nowrap;
    color: var(--text-secondary);

    &:first-child {
      padding-left: 0;
    }
  `,
  divider: css`
    width: 1px;
    height: 16px;
    background: var(--divider);
    flex-shrink: 0;
  `,
  label: css`
    color: var(--text-muted);
  `,
  value: css`
    font-variant-numeric: tabular-nums;
    font-family: var(--console-font-numeric);
    color: var(--text-primary);
    font-weight: 500;
  `
}));

const ClusterHealth: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const {
    clusterHealthy,
    readyWorkers,
    totalWorkers,
    gpuReady,
    gpuTotal,
    resource_counts
  } = useContext(DashboardContext);

  const deployments = Number(resource_counts?.model_count || 0);
  const items = [
    {
      label: intl.formatMessage({ id: 'dashboard.workers' }),
      value: `${readyWorkers} / ${totalWorkers || readyWorkers}`
    },
    {
      label: intl.formatMessage({ id: 'dashboard.totalgpus' }),
      value: `${gpuReady || gpuTotal || 0} / ${gpuTotal || 0}`
    },
    {
      label: intl.formatMessage({ id: 'dashboard.deployments' }),
      value: String(deployments)
    },
    {
      label: intl.formatMessage({ id: 'dashboard.services' }),
      value: clusterHealthy
        ? intl.formatMessage({ id: 'dashboard.services.operational' })
        : intl.formatMessage({ id: 'dashboard.clusterHealth.degraded' })
    }
  ];

  return (
    <div className={styles.bar}>
      <div className={styles.item}>
        <StatusBadge tone={clusterHealthy ? 'success' : 'warning'} plain>
          {intl.formatMessage({
            id: clusterHealthy
              ? 'dashboard.clusterHealth.healthy'
              : 'dashboard.clusterHealth.degraded'
          })}
        </StatusBadge>
      </div>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'contents' }}>
          <span className={styles.divider} />
          <span className={styles.item}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default ClusterHealth;
