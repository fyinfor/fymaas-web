import { ProgressMetric, SectionCard } from '@/components/console';
import { useIntl } from '@umijs/max';
import React, { useEffect } from 'react';
import { useClusterSystemLoad } from '../../services/use-cluster-detail';

const ClusterSystemLoad: React.FC<{ clusterId: number }> = ({ clusterId }) => {
  const { systemLoad, fetchClusterSystemLoad } = useClusterSystemLoad();
  const intl = useIntl();

  useEffect(() => {
    if (clusterId) {
      fetchClusterSystemLoad({ cluster_id: clusterId });
    }
  }, [clusterId]);

  const current = systemLoad.current;

  return (
    <SectionCard
      title={intl.formatMessage({ id: 'dashboard.resourceSummary' })}
      style={{ marginTop: 16 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 24
        }}
      >
        <ProgressMetric
          label={intl.formatMessage({ id: 'dashboard.gpuutilization' })}
          percent={current.gpu}
          color="var(--console-chart-gpu)"
        />
        <ProgressMetric
          label={intl.formatMessage({ id: 'dashboard.vramutilization' })}
          percent={current.vram}
          color="var(--console-chart-vram)"
        />
        <ProgressMetric
          label={intl.formatMessage({ id: 'dashboard.cpuutilization' })}
          percent={current.cpu}
          color="var(--console-chart-cpu)"
        />
        <ProgressMetric
          label={intl.formatMessage({ id: 'dashboard.memoryutilization' })}
          percent={current.ram}
          color="var(--console-chart-memory)"
        />
      </div>
    </SectionCard>
  );
};

export default ClusterSystemLoad;
