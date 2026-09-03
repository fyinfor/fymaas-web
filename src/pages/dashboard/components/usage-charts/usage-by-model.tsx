import { RankList, SectionCard } from '@/components/console';
import useQueryTimeSeriesData from '@/pages/usage/services/use-query-timeseries-data';
import { useIntl } from '@umijs/max';
import { Spin } from 'antd';
import { useEffect, useMemo } from 'react';
import {
  DashboardUsageCommonParams,
  toUsagePieData,
  UsageChartDatum
} from '../../config';
import { formatCompactNumber } from '../../utils/format';

interface UsageByModelProps {
  commonParams: DashboardUsageCommonParams;
}

const UsageByModel: React.FC<UsageByModelProps> = ({ commonParams }) => {
  const intl = useIntl();
  const apiQuery = useQueryTimeSeriesData({ key: 'apiRequestsByModelData' });

  useEffect(() => {
    apiQuery
      .fetchData({
        ...commonParams,
        metric: 'api_requests',
        group_by: ['route'],
        page: 1,
        perPage: 10,
        sort_by: '-api_requests'
      })
      .catch(() => {});
  }, [commonParams]);

  const apiData = useMemo<UsageChartDatum[]>(
    () => toUsagePieData(apiQuery.detailData, 'route', 'api_requests'),
    [apiQuery.detailData]
  );

  const total = apiData.reduce((sum, item) => sum + item.value, 0);
  const items = apiData.map((item) => ({
    key: item.name,
    name: item.name,
    value: formatCompactNumber(item.value),
    percent: total ? (item.value / total) * 100 : 0,
    extra: `${total ? Math.round((item.value / total) * 100) : 0}%`
  }));

  return (
    <SectionCard title={intl.formatMessage({ id: 'dashboard.modelUsage' })}>
      {apiQuery.loading && !apiData.length ? (
        <div
          style={{
            minHeight: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Spin />
        </div>
      ) : (
        <RankList items={items} color="var(--console-chart-request)" />
      )}
    </SectionCard>
  );
};

export default UsageByModel;
