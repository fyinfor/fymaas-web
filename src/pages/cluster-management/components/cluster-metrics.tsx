import { ProgressMetric, SectionCard } from '@/components/console';
import { useSearchParams } from '@umijs/max';
import { Col, Row } from 'antd';
import { useEffect, useState } from 'react';
import { queryClusterDetail } from '../apis';
import TrendChart from './trend-chart';

const metricsMap = {
  cpu: {
    label: 'CPU',
    type: 'CPU',
    intl: false,
    color: '#F59E0B'
  },
  ram: {
    label: 'RAM',
    type: 'RAM',
    intl: false,
    color: '#249EC2'
  },
  allocated: {
    label: 'Allocated',
    type: 'Allocated',
    intl: false,
    color: '#F59E0B'
  },
  gpu: {
    label: 'GPU',
    type: 'GPU',
    intl: false,
    color: '#18A875'
  },
  vram: {
    label: 'VRAM',
    type: 'VRAM',
    intl: false,
    color: '#7567B8'
  }
};

const ClusterMetrics = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [detailContent, setDetailContent] = useState<{
    current: {
      cpu: number | null;
      ram: number | null;
      gpu: number | null;
      vram: number | null;
    };
    history: Record<string, { timestamp: number; value: number }[]>;
  }>({
    current: {
      cpu: null,
      ram: null,
      gpu: null,
      vram: null
    },
    history: {}
  });

  const getClusterDetail = async () => {
    if (!id) {
      return;
    }
    try {
      const response = await queryClusterDetail({
        cluster_id: id
      });
      const current = response.system_load?.current;
      setDetailContent({
        current: {
          cpu: current?.cpu ?? null,
          ram: current?.ram ?? null,
          gpu: current?.gpu ?? null,
          vram: current?.vram ?? null
        },
        history: response.system_load?.history || {}
      });
    } catch (error) {
      setDetailContent({
        current: {
          cpu: null,
          ram: null,
          gpu: null,
          vram: null
        },
        history: {}
      });
    }
  };

  useEffect(() => {
    if (id) {
      getClusterDetail();
    }
  }, [id]);

  return (
    <div>
      <SectionCard title="Current Utilization" style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 24
          }}
        >
          <ProgressMetric
            label="GPU Utilization"
            percent={detailContent.current.gpu}
            color="var(--console-chart-gpu)"
          />
          <ProgressMetric
            label="CPU Utilization"
            percent={detailContent.current.cpu}
            color="var(--console-chart-cpu)"
          />
          <ProgressMetric
            label="RAM Utilization"
            percent={detailContent.current.ram}
            color="var(--console-chart-memory)"
          />
          <ProgressMetric
            label="VRAM Utilization"
            percent={detailContent.current.vram}
            color="var(--console-chart-vram)"
          />
        </div>
      </SectionCard>
      <SectionCard title="System Load">
        <Row style={{ marginBottom: 16 }} gutter={16}>
          <Col span={12}>
            <TrendChart
              data={detailContent?.history}
              metrics={['vram']}
              metricsMap={metricsMap}
              title="VRAM"
            />
          </Col>
          <Col span={12}>
            <TrendChart
              data={detailContent?.history}
              metrics={['ram']}
              metricsMap={metricsMap}
              title="RAM"
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <TrendChart
              data={detailContent?.history}
              metrics={['cpu']}
              metricsMap={metricsMap}
              title="CPU"
            />
          </Col>
          <Col span={12}>
            <TrendChart
              data={detailContent?.history}
              metrics={['gpu']}
              metricsMap={metricsMap}
              title="GPU"
            />
          </Col>
        </Row>
      </SectionCard>
    </div>
  );
};

export default ClusterMetrics;
