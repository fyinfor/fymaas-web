import { ErrorState, PageHeader } from '@/components/console';
import PageBox, {
  HeaderLeft,
  usePageSurface
} from '@/pages/_components/page-box';
import { useIntl } from '@umijs/max';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import DashboardInner from './components/dahboard-inner';
import DashboardSkeleton from './components/dashboard-skeleton';
import DashboardContext from './config/dashboard-context';
import useDashboardInfra from './hooks/use-dashboard-infra';
import useQueryDashboard from './services/use-query-dashboard';

const Dashboard: React.FC = () => {
  const intl = useIntl();
  const { fetchData, loading, data, cancelRequest } = useQueryDashboard();
  const infra = useDashboardInfra(data);
  const [loadError, setLoadError] = useState(false);
  const [lastSuccess, setLastSuccess] = useState<string>();
  usePageSurface('canvas');

  const reload = async () => {
    try {
      await fetchData({});
      setLoadError(false);
      setLastSuccess(dayjs().format('HH:mm:ss'));
    } catch {
      setLoadError(true);
    }
  };

  useEffect(() => {
    reload();
    return () => {
      cancelRequest();
    };
  }, []);

  return (
    <DashboardContext.Provider
      value={{ ...data, ...infra, fetchData: fetchData }}
    >
      <HeaderLeft>
        <PageHeader
          title={intl.formatMessage({ id: 'menu.dashboard' })}
          subtitle={intl.formatMessage({ id: 'page.subtitle.dashboard' })}
        />
      </HeaderLeft>
      <PageBox>
        {loadError && !data?.resource_counts ? (
          <ErrorState lastSuccess={lastSuccess} onRetry={reload} />
        ) : loading && !data?.resource_counts ? (
          <DashboardSkeleton />
        ) : (
          <DashboardInner />
        )}
      </PageBox>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
