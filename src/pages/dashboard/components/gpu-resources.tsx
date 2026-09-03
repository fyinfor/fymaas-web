import { SectionCard, StatusBadge } from '@/components/console';
import { history, useIntl } from '@umijs/max';
import { createStyles } from 'antd-style';
import { useContext, useMemo } from 'react';
import { DashboardContext } from '../config/dashboard-context';
import { bytesToGb, formatPercent } from '../utils/format';

const MAX_VISIBLE = 6;

const useStyles = createStyles(({ css }) => ({
  stats: css`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0;
    margin-bottom: 16px;
    font-size: 13px;
  `,
  stat: css`
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 0 14px;
    color: var(--text-secondary);

    &:first-child {
      padding-left: 0;
    }
  `,
  divider: css`
    width: 1px;
    height: 14px;
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
    font-weight: 600;
  `,
  list: css`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,
  row: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  top: css`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  `,
  name: css`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    color: var(--text-primary);
  `,
  index: css`
    color: var(--text-muted);
    margin-right: 8px;
    font-variant-numeric: tabular-nums;
    font-family: var(--console-font-numeric);
  `,
  meta: css`
    display: inline-flex;
    align-items: baseline;
    gap: 10px;
    flex-shrink: 0;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-family: var(--console-font-numeric);
    color: var(--text-secondary);
  `,
  util: css`
    font-weight: 600;
    color: var(--text-primary);
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
    background: var(--gpu);
  `,
  empty: css`
    font-size: 13px;
    color: var(--text-muted);
    padding: 24px 0;
    text-align: center;
  `,
  more: css`
    margin-top: 12px;
    font-size: 12px;
  `
}));

const GpuResources: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const { gpus, gpuTotal, gpuInUse, clusterHealthy } =
    useContext(DashboardContext);

  const visible = useMemo(() => {
    return [...gpus]
      .sort(
        (a, b) =>
          Number(b.core?.utilization_rate || 0) -
          Number(a.core?.utilization_rate || 0)
      )
      .slice(0, MAX_VISIBLE);
  }, [gpus]);

  return (
    <SectionCard title={intl.formatMessage({ id: 'dashboard.gpuResources' })}>
      <div className={styles.stats}>
        <span className={styles.stat}>
          <span className={styles.value}>{gpuTotal || 0}</span>
          <span className={styles.label}>
            {intl.formatMessage({ id: 'dashboard.gpu.total' })}
          </span>
        </span>
        <span className={styles.divider} />
        <span className={styles.stat}>
          <span className={styles.value}>
            {Math.max(gpuTotal - gpuInUse, 0)}
          </span>
          <span className={styles.label}>
            {intl.formatMessage({ id: 'dashboard.gpu.available' })}
          </span>
        </span>
        <span className={styles.divider} />
        <span className={styles.stat}>
          <span className={styles.value}>{gpuInUse}</span>
          <span className={styles.label}>
            {intl.formatMessage({ id: 'dashboard.gpu.allocated' })}
          </span>
        </span>
        <span className={styles.divider} />
        <span className={styles.stat}>
          <StatusBadge tone={clusterHealthy ? 'success' : 'warning'} plain>
            {intl.formatMessage({
              id: clusterHealthy
                ? 'dashboard.clusterHealth.healthy'
                : 'dashboard.clusterHealth.degraded'
            })}
          </StatusBadge>
        </span>
      </div>
      {visible.length ? (
        <div className={styles.list}>
          {visible.map((gpu) => {
            const util = Number(gpu.core?.utilization_rate || 0);
            const used = bytesToGb(gpu.memory?.used || 0);
            const total = bytesToGb(gpu.memory?.total || 0);
            return (
              <div className={styles.row} key={gpu.uuid || gpu.id}>
                <div className={styles.top}>
                  <div className={styles.name}>
                    <span className={styles.index}>GPU {gpu.index}</span>
                    {gpu.name || 'GPU'}
                  </div>
                  <div className={styles.meta}>
                    <span className={styles.util}>{formatPercent(util)}</span>
                    <span>
                      {total
                        ? `${used.toFixed(1)} / ${Math.round(total)}GB`
                        : '—'}
                    </span>
                  </div>
                </div>
                <div className={styles.bar}>
                  <div
                    className={styles.fill}
                    style={{ width: `${Math.min(100, Math.max(0, util))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          {intl.formatMessage({ id: 'dashboard.na' })}
        </div>
      )}
      {gpus.length > MAX_VISIBLE ? (
        <a
          className={styles.more}
          onClick={() => history.push('/resources/gpus')}
        >
          {intl.formatMessage({ id: 'dashboard.viewAllGpus' })}
        </a>
      ) : null}
    </SectionCard>
  );
};

export default GpuResources;
