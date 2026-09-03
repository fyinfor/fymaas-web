import { SectionCard } from '@/components/console';
import { useIntl } from '@umijs/max';
import { createStyles } from 'antd-style';
import { useContext, useMemo } from 'react';
import { DashboardContext } from '../config/dashboard-context';
import { formatCompactNumber } from '../utils/format';

const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  `,
  item: css`
    padding: 14px 16px;
    border-radius: 10px;
    background: var(--console-bg-page);
    border: 1px solid var(--console-divider);
    min-height: 88px;
  `,
  label: css`
    font-size: 12px;
    color: var(--console-text-tertiary);
    margin-bottom: 8px;
  `,
  value: css`
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
    font-family: var(--console-font-numeric);
    color: var(--console-text);
    line-height: 1.2;
  `,
  unit: css`
    margin-left: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--console-text-tertiary);
  `
}));

const InferencePerformance: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const { model_usage, tokenVolume, requestVolume } =
    useContext(DashboardContext);

  const throughput = useMemo(() => {
    const prompt = model_usage?.prompt_token_history || [];
    const completion = model_usage?.completion_token_history || [];
    const stamps = [...prompt, ...completion]
      .map((item) => Number(item?.timestamp || 0))
      .filter(Boolean);
    if (stamps.length < 2 || !tokenVolume) return 0;
    const span = Math.max(...stamps) - Math.min(...stamps);
    if (span <= 0) return 0;
    return tokenVolume / span;
  }, [model_usage, tokenVolume]);

  return (
    <SectionCard title={intl.formatMessage({ id: 'dashboard.inference' })}>
      <div className={styles.grid}>
        <div className={styles.item}>
          <div className={styles.label}>
            {intl.formatMessage({ id: 'dashboard.inference.throughput' })}
          </div>
          <div className={styles.value}>
            {throughput ? formatCompactNumber(throughput) : '—'}
            {throughput ? <span className={styles.unit}>tok/s</span> : null}
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.label}>
            {intl.formatMessage({ id: 'dashboard.inference.latency' })}
          </div>
          <div className={styles.value}>
            {intl.formatMessage({ id: 'dashboard.na' })}
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.label}>
            {intl.formatMessage({ id: 'dashboard.inference.requests' })}
          </div>
          <div className={styles.value}>
            {formatCompactNumber(requestVolume)}
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.label}>
            {intl.formatMessage({ id: 'dashboard.inference.errorRate' })}
          </div>
          <div className={styles.value}>
            {intl.formatMessage({ id: 'dashboard.na' })}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default InferencePerformance;
