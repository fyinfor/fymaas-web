import { ProgressMetric, SectionCard } from '@/components/console';
import { useIntl } from '@umijs/max';
import _ from 'lodash';
import { useContext } from 'react';
import { DashboardContext } from '../config/dashboard-context';
import { bytesToGb } from '../utils/format';

const ResourceSummary: React.FC<{
  current?: {
    gpu?: number;
    vram?: number;
    cpu?: number;
    ram?: number;
  };
}> = ({ current }) => {
  const intl = useIntl();
  const { vramUsed, vramTotal, gpuInUse, gpuTotal, workers } =
    useContext(DashboardContext);

  const cpuTotal = workers.reduce(
    (sum, worker) => sum + Number(worker.status?.cpu?.total || 0),
    0
  );
  const cpuUsed = workers.reduce((sum, worker) => {
    const total = Number(worker.status?.cpu?.total || 0);
    const rate = Number(worker.status?.cpu?.utilization_rate || 0);
    return sum + (total * rate) / 100;
  }, 0);
  const memTotal = workers.reduce(
    (sum, worker) => sum + Number(worker.status?.memory?.total || 0),
    0
  );
  const memUsed = workers.reduce(
    (sum, worker) => sum + Number(worker.status?.memory?.used || 0),
    0
  );

  const gpu = _.round(current?.gpu || 0, 1);
  const vram = _.round(
    current?.vram || (vramTotal ? (vramUsed / vramTotal) * 100 : 0),
    1
  );
  const cpu = _.round(current?.cpu || 0, 1);
  const ram = _.round(current?.ram || 0, 1);

  return (
    <SectionCard
      title={intl.formatMessage({ id: 'dashboard.resourceSummary' })}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ProgressMetric
          label="GPU"
          percent={gpu}
          color="var(--console-chart-gpu)"
          detail={`${gpuInUse} / ${gpuTotal || 0}`}
        />
        <ProgressMetric
          label={intl.formatMessage({ id: 'dashboard.vram' })}
          percent={vram}
          color="var(--console-chart-vram)"
          detail={
            vramTotal
              ? `${Math.round(bytesToGb(vramUsed))} / ${Math.round(bytesToGb(vramTotal))} GB`
              : undefined
          }
        />
        <ProgressMetric
          label="CPU"
          percent={cpu}
          color="var(--console-chart-cpu)"
          detail={
            cpuTotal ? `${cpuUsed.toFixed(1)} / ${cpuTotal} vCPU` : undefined
          }
        />
        <ProgressMetric
          label={intl.formatMessage({ id: 'dashboard.memory' })}
          percent={ram}
          color="var(--console-chart-memory)"
          detail={
            memTotal
              ? `${Math.round(bytesToGb(memUsed))} / ${Math.round(bytesToGb(memTotal))} GB`
              : undefined
          }
        />
      </div>
    </SectionCard>
  );
};

export default ResourceSummary;
