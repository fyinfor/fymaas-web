import { ProgressMetric, SectionCard } from '@/components/console';
import { FormDrawer } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { createStyles } from 'antd-style';
import React from 'react';
import { BenchmarkListItem } from '../config/types';

const COLORS = [
  'var(--console-brand)',
  'var(--console-chart-vram)',
  'var(--console-chart-cpu)',
  'var(--console-chart-memory)'
];

type MetricKey =
  | 'tokens_per_second_mean'
  | 'time_to_first_token_mean'
  | 'inter_token_latency_mean';

const METRICS: Array<{
  key: MetricKey;
  titleId: string;
  unit: string;
  higherIsBetter: boolean;
}> = [
  {
    key: 'tokens_per_second_mean',
    titleId: 'benchmark.table.tps',
    unit: 'tok/s',
    higherIsBetter: true
  },
  {
    key: 'time_to_first_token_mean',
    titleId: 'benchmark.table.ttft',
    unit: 'ms',
    higherIsBetter: false
  },
  {
    key: 'inter_token_latency_mean',
    titleId: 'benchmark.table.tpot',
    unit: 'ms',
    higherIsBetter: false
  }
];

const useStyles = createStyles(({ css }) => ({
  stack: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  hint: css`
    font-size: 12px;
    color: var(--console-text-tertiary);
    line-height: 18px;
    margin-bottom: 4px;
  `,
  value: css`
    font-variant-numeric: tabular-nums;
    font-family: var(--console-font-numeric);
  `
}));

const formatMetric = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
};

const CompareDrawer: React.FC<{
  open: boolean;
  rows: BenchmarkListItem[];
  onClose: () => void;
}> = ({ open, rows, onClose }) => {
  const intl = useIntl();
  const { styles } = useStyles();

  return (
    <FormDrawer
      title={intl.formatMessage({ id: 'benchmark.compare.title' })}
      open={open}
      onCancel={onClose}
      width={640}
      footer={null}
    >
      <div className={styles.hint}>
        {intl.formatMessage({ id: 'benchmark.compare.hint' })}
      </div>
      <div className={styles.stack}>
        {METRICS.map((metric) => {
          const values = rows.map((row) => {
            const raw = row[metric.key];
            return typeof raw === 'number' ? raw : null;
          });
          const present = values.filter((v): v is number => v != null);
          const max = present.length ? Math.max(...present) : 0;
          const best = present.length
            ? metric.higherIsBetter
              ? Math.max(...present)
              : Math.min(...present)
            : null;

          return (
            <SectionCard
              key={metric.key}
              title={`${intl.formatMessage({ id: metric.titleId })} (${metric.unit})`}
            >
              <div className={styles.stack}>
                {rows.map((row, index) => {
                  const value = values[index];
                  const percent =
                    value == null || max <= 0 ? null : (value / max) * 100;
                  const isBest =
                    best != null && value === best && present.length > 1;
                  return (
                    <ProgressMetric
                      key={row.id}
                      label={
                        <span>
                          {row.model_name || row.name}
                          {isBest
                            ? ` · ${intl.formatMessage({
                                id: metric.higherIsBetter
                                  ? 'benchmark.compare.higher'
                                  : 'benchmark.compare.faster'
                              })}`
                            : ''}
                        </span>
                      }
                      percent={percent}
                      display={
                        <span className={styles.value}>
                          {formatMetric(value) ?? '—'}
                        </span>
                      }
                      color={COLORS[index % COLORS.length]}
                      detail={
                        <span>
                          {metric.unit}
                          <span style={{ marginLeft: 8, opacity: 0.7 }}>
                            {row.name}
                          </span>
                        </span>
                      }
                    />
                  );
                })}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </FormDrawer>
  );
};

export default CompareDrawer;
