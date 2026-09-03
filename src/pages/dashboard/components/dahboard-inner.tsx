import { createStyles } from 'antd-style';
import ActiveTable from './active-table';
import ClusterHealth from './cluster-health';
import GpuResources from './gpu-resources';
import InferencePerformance from './inference-performance';
import KpiOverview from './kpi-overview';
import SystemLoad from './system-load';
import Usage from './usage';

const useStyles = createStyles(({ css }) => ({
  page: css`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  split: css`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 16px;

    @media (max-width: 1280px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `
}));

const Dashboard: React.FC = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.page}>
      <ClusterHealth />
      <KpiOverview />
      <SystemLoad />
      <div className={styles.split}>
        <GpuResources />
        <InferencePerformance />
      </div>
      <ActiveTable />
      <Usage />
    </div>
  );
};

export default Dashboard;
