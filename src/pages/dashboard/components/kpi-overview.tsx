import { KpiCard } from '@/components/console';
import { IconFont } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { createStyles } from 'antd-style';
import { useContext } from 'react';
import { DashboardContext } from '../config/dashboard-context';
import {
  formatCompactNumber,
  formatGbPair,
  formatPercent
} from '../utils/format';

const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1280px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: 900px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  `
}));

const KpiOverview: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const {
    resource_counts,
    gpuTotal,
    gpuReady,
    gpuInUse,
    vramUsed,
    vramTotal,
    requestVolume,
    requestHistory,
    gpuHistory,
    vramHistory
  } = useContext(DashboardContext);

  const vramPercent = vramTotal ? (vramUsed / vramTotal) * 100 : 0;

  return (
    <div className={styles.grid}>
      <KpiCard
        icon={<IconFont type="icon-gpu1" />}
        label={intl.formatMessage({ id: 'dashboard.kpi.gpu' })}
        value={`${gpuReady || gpuTotal || 0} / ${gpuTotal || resource_counts?.gpu_count || 0}`}
        hint={`${gpuInUse} ${intl.formatMessage({
          id: 'dashboard.kpi.allocated'
        })}`}
        sparkline={gpuHistory}
        sparkColor="var(--console-chart-gpu)"
      />
      <KpiCard
        icon={<IconFont type="icon-rocket-launch1" />}
        label={intl.formatMessage({ id: 'dashboard.kpi.deployments' })}
        value={resource_counts?.model_count || 0}
        hint={intl.formatMessage({ id: 'dashboard.activeDeployments' })}
        sparkline={requestHistory.slice(-12)}
        sparkColor="var(--console-chart-vram)"
      />
      <KpiCard
        icon={<IconFont type="icon-instance-template-outlined" />}
        label={intl.formatMessage({ id: 'dashboard.kpi.replicas' })}
        value={resource_counts?.model_instance_count || 0}
        hint={intl.formatMessage({ id: 'models.form.replicas' })}
        sparkColor="var(--console-chart-request)"
      />
      <KpiCard
        icon={<IconFont type="icon-storage-outlined" />}
        label={intl.formatMessage({ id: 'dashboard.kpi.vram' })}
        value={formatGbPair(vramUsed, vramTotal)}
        hint={`${formatPercent(vramPercent)} ${intl.formatMessage({
          id: 'dashboard.kpi.used'
        })}`}
        sparkline={vramHistory}
        sparkColor="var(--console-chart-vram)"
      />
      <KpiCard
        icon={<IconFont type="icon-usage-outlined" />}
        label={intl.formatMessage({ id: 'dashboard.kpi.requests' })}
        value={`${formatCompactNumber(requestVolume)} / 24h`}
        hint={intl.formatMessage({ id: 'dashboard.tokens' })}
        sparkline={requestHistory}
        sparkColor="var(--console-chart-request)"
      />
    </div>
  );
};

export default KpiOverview;
