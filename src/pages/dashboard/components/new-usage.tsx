import { Col, Row, Segmented } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { DashboardUsageCommonParams } from '../config';
import useTopTokenUsageByUser from '../hooks/use-top-token-usage-by-user';
import TopTokenUsageByUser from './usage-charts/top-token-usage-by-user';
import UsageByModel from './usage-charts/usage-by-model';

const RANGE_DAYS = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 }
];

const NewUsage = () => {
  const [days, setDays] = useState(1);

  const dateRange = useMemo(
    () => ({
      start_date: dayjs()
        .subtract(days - 1, 'days')
        .format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD')
    }),
    [days]
  );

  const commonParams = useMemo<DashboardUsageCommonParams>(
    () => ({
      ...dateRange,
      scope: 'all',
      granularity: 'day',
      filters: {}
    }),
    [dateRange, days]
  );

  const userUsage = useTopTokenUsageByUser(commonParams);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 12
        }}
      >
        <Segmented
          size="small"
          value={days}
          options={RANGE_DAYS.map((item) => ({
            label: item.label,
            value: item.days
          }))}
          onChange={(value) => setDays(Number(value))}
        />
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <UsageByModel commonParams={commonParams} />
        </Col>
        <Col xs={24} xl={12}>
          <TopTokenUsageByUser
            rankData={userUsage.rankData}
            loading={userUsage.loading}
          />
        </Col>
      </Row>
    </div>
  );
};

export default NewUsage;
