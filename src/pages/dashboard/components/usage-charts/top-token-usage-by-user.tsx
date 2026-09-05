import { MetricSkeleton, RankList, SectionCard } from '@/components/console';
import { history, useIntl } from '@umijs/max';
import { useMemo } from 'react';
import type useTopTokenUsageByUser from '../../hooks/use-top-token-usage-by-user';
import { formatCompactNumber } from '../../utils/format';

type RankData = ReturnType<typeof useTopTokenUsageByUser>['rankData'];

interface TopTokenUsageByUserProps {
  rankData: RankData;
  loading: boolean;
}

const TopTokenUsageByUser: React.FC<TopTokenUsageByUserProps> = ({
  rankData,
  loading
}) => {
  const intl = useIntl();

  const rows = useMemo(() => {
    const totals = rankData.names.map((name, index) => {
      const tokens = rankData.series.reduce(
        (sum, series) => sum + Number(series.data[index]?.value || 0),
        0
      );
      return { name, tokens };
    });
    const max = Math.max(...totals.map((item) => item.tokens), 1);
    const sum = totals.reduce((acc, item) => acc + item.tokens, 0) || 1;
    return totals.map((item) => ({
      key: item.name,
      name: item.name,
      value: formatCompactNumber(item.tokens),
      percent: (item.tokens / max) * 100,
      extra: `${Math.round((item.tokens / sum) * 100)}%`
    }));
  }, [rankData]);

  return (
    <SectionCard
      title={intl.formatMessage({ id: 'dashboard.topConsumers' })}
      extra={
        <a
          onClick={() => history.push('/access-control/usage')}
          style={{ fontSize: 12 }}
        >
          {intl.formatMessage({ id: 'dashboard.viewAllUsers' })}
        </a>
      }
    >
      {loading && !rows.length ? (
        <MetricSkeleton rows={5} style={{ minHeight: 220, paddingTop: 8 }} />
      ) : (
        <RankList items={rows} color="var(--console-chart-vram)" />
      )}
    </SectionCard>
  );
};

export default TopTokenUsageByUser;
