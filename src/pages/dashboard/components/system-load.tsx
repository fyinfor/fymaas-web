import { SectionCard } from '@/components/console';
import { queryClusterList } from '@/pages/cluster-management/apis';
import { BaseSelect } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '../config/dashboard-context';
import ResourceSummary from './resource-summary';
import ResourceUtilization from './resource-utilization';

const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-columns: minmax(0, 65fr) minmax(0, 35fr);
    gap: 16px;

    @media (max-width: 1280px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `
}));

const RANGE_OPTIONS = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 }
];

const SystemLoad = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const { system_load, fetchData } = useContext(DashboardContext);
  const [systemLoadData, setSystemLoadData] = useState<any>(system_load || {});
  const [clusterList, setClusterList] = useState<Global.BaseOption<number>[]>(
    []
  );
  const [hours, setHours] = useState(24);

  useEffect(() => {
    setSystemLoadData(system_load || {});
  }, [system_load]);

  const handleClusterChange = async (value: number) => {
    try {
      const res: any = await fetchData({ cluster_id: value });
      setSystemLoadData(res.system_load || {});
    } catch (error) {
      setSystemLoadData({});
    }
  };

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await queryClusterList({ page: -1 });
        const options = res.items.map((cluster: any) => ({
          label: cluster.name,
          value: cluster.id
        }));
        setClusterList(options);
      } catch (error) {
        setClusterList([]);
      }
    };
    fetchClusters();
  }, []);

  return (
    <div className={styles.grid}>
      <SectionCard
        title={intl.formatMessage({ id: 'dashboard.resourceUtilization' })}
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Segmented
              size="small"
              value={hours}
              options={RANGE_OPTIONS.map((item) => ({
                label: item.label,
                value: item.hours
              }))}
              onChange={(value) => setHours(Number(value))}
            />
            <BaseSelect
              allowClear
              onChange={handleClusterChange}
              style={{ width: 180 }}
              size="middle"
              options={clusterList}
              placeholder={intl.formatMessage({
                id: 'clusters.filterBy.cluster'
              })}
            />
          </div>
        }
      >
        <ResourceUtilization data={systemLoadData?.history} hours={hours} />
      </SectionCard>
      <ResourceSummary current={systemLoadData?.current} />
    </div>
  );
};

export default SystemLoad;
