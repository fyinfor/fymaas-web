import { ResourceBar } from '@/components/console';
import { useIntl } from '@umijs/max';
import { Flex, Tooltip } from 'antd';
import _ from 'lodash';
import React from 'react';
import { AcceleratorGaugeKeys, GaugeLabelIdMap } from '../config';
import {
  AcceleratorGaugeItem,
  GaugeKey,
  GaugeState,
  GaugeValues
} from '../config/types';
import styles from '../styles/utilization-cell.module.less';

const RESOURCE_COLOR: Record<GaugeKey, string> = {
  gpu: 'var(--gpu)',
  vram: 'var(--vram)',
  cpu: 'var(--cpu)',
  memory: 'var(--memory)',
  storage: 'var(--text-muted)'
};

const NO_DATA: GaugeState = { percent: null };

const formatMiB = (value: number) =>
  value >= 1024 ? `${_.round(value / 1024, 1)} GiB` : `${value} MiB`;

const gaugeTooltip = (key: GaugeKey, label: string, state: GaugeState) => {
  if (state.percent === null) {
    return label;
  }
  if (key === 'gpu') {
    return `${label}: ${_.round(state.percent, 1)}%`;
  }
  if (state.used === undefined || !state.total) {
    return label;
  }
  if (key === 'cpu') {
    return `${label}: ${_.round(state.used / 1000, 2)} / ${_.round(state.total / 1000, 2)} cores`;
  }
  return `${label}: ${formatMiB(state.used)} / ${formatMiB(state.total)}`;
};

const PerCardBars: React.FC<{
  gaugeKey: GaugeKey;
  items: AcceleratorGaugeItem[];
}> = ({ gaugeKey, items }) => (
  <span
    className={`${styles.cardGrid} ${items.length > 2 ? styles.cardGridSplit : ''}`}
  >
    {items.map((item) => {
      const percent = _.clamp(_.round(item.percent), 0, 100);
      return (
        <Flex key={item.index} align="center" gap={8}>
          <span className={styles.cardIndex}>{item.index}</span>
          <div style={{ width: 88 }}>
            <ResourceBar percent={percent} color={RESOURCE_COLOR[gaugeKey]} />
          </div>
          {gaugeKey === 'vram' && item.used !== undefined && !!item.total && (
            <span className={styles.cardFigures}>
              {formatMiB(item.used)} / {formatMiB(item.total)}
            </span>
          )}
        </Flex>
      );
    })}
  </span>
);

const UtilizationCell: React.FC<{
  gaugeKey: GaugeKey;
  values?: GaugeValues;
  hasAccelerators: boolean;
  measurable: boolean;
}> = ({ gaugeKey, values, hasAccelerators, measurable }) => {
  const intl = useIntl();

  const isAcceleratorGauge = _.includes(AcceleratorGaugeKeys, gaugeKey);

  if (isAcceleratorGauge && !hasAccelerators) {
    return null;
  }

  if (!measurable) {
    return <span className={styles.noData}>-</span>;
  }

  const label = intl.formatMessage({ id: GaugeLabelIdMap[gaugeKey] });
  const state = values?.[gaugeKey] ?? NO_DATA;
  const percent =
    state.percent === null ? null : _.clamp(_.round(state.percent), 0, 100);
  const hasBreakdown = isAcceleratorGauge && (state.items?.length ?? 0) > 1;
  const detail =
    gaugeKey !== 'gpu' && state.used !== undefined && state.total
      ? formatMiB(state.used)
      : undefined;
  const bar = (
    <ResourceBar
      percent={percent}
      color={RESOURCE_COLOR[gaugeKey]}
      detail={detail}
    />
  );

  if (hasBreakdown) {
    return (
      <Tooltip
        title={
          <PerCardBars
            gaugeKey={gaugeKey}
            items={state.items as AcceleratorGaugeItem[]}
          />
        }
      >
        {bar}
      </Tooltip>
    );
  }

  return <Tooltip title={gaugeTooltip(gaugeKey, label, state)}>{bar}</Tooltip>;
};

export default React.memo(UtilizationCell);
