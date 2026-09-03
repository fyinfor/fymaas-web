import PageBox, {
  HeaderLeft,
  usePageSurface
} from '@/pages/_components/page-box';
import { useIntl } from '@umijs/max';
import { Spin } from 'antd';
import { useEffect } from 'react';
import DashboardInner from './components/dahboard-inner';
import DashboardContext from './config/dashboard-context';
import useDashboardInfra from './hooks/use-dashboard-infra';
import useQueryDashboard from './services/use-query-dashboard';

const Dashboard: React.FC = () => {
  const intl = useIntl();
  const { fetchData, loading, data, cancelRequest } = useQueryDashboard();
  const infra = useDashboardInfra(data);
  usePageSurface('canvas');

  useEffect(() => {
    fetchData({});
    return () => {
      cancelRequest();
    };
  }, []);

  return (
    <DashboardContext.Provider
      value={{ ...data, ...infra, fetchData: fetchData }}
    >
      <HeaderLeft>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '-0.2px',
              lineHeight: '24px',
              color: 'var(--text-primary)'
            }}
          >
            {intl.formatMessage({ id: 'menu.dashboard' })}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--text-muted)',
              lineHeight: '18px'
            }}
          >
            {intl.formatMessage({ id: 'dashboard.subtitle' })}
          </span>
        </div>
      </HeaderLeft>
      <PageBox>
        <Spin spinning={loading} style={{ minHeight: 300 }} size="middle">
          <DashboardInner />
        </Spin>
      </PageBox>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
