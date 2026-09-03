import { ResourceBar, StatusBadge } from '@/components/console';
import { tableSorter } from '@/config/settings';
import { usePluginListColumns } from '@/plugins/list-extra-columns';
import { convertFileSize } from '@/utils';
import { AutoTooltip } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { ColumnsType } from 'antd/lib/table';
import _ from 'lodash';
import { useMemo } from 'react';
import { GPUDeviceItem } from '../config/types';

const isAllocated = (record: GPUDeviceItem) => {
  return (
    Number(record.memory?.allocated || 0) > 0 ||
    Number(record.core?.utilization_rate || 0) > 1
  );
};

const useGPUColumns = (props: {
  loadend: boolean;
  firstLoad: boolean;
  clusterList: Global.BaseOption<number>[];
  sortOrder: string[];
}): ColumnsType<GPUDeviceItem> => {
  const { clusterList, sortOrder } = props;
  const intl = useIntl();
  const pluginCols = usePluginListColumns('gpus');

  return useMemo(() => {
    const pluginRendered = pluginCols.map((c) => ({
      title: intl.formatMessage({ id: c.titleId }),
      key: c.key,
      ellipsis: { showTitle: false },
      render: (_text: any, record: GPUDeviceItem) => c.render(record)
    }));
    return [
      {
        title: intl.formatMessage({ id: 'common.table.name' }),
        dataIndex: 'name',
        width: 260,
        minWidth: 32,
        sorter: tableSorter(1),
        render: (text: string, record: GPUDeviceItem) => (
          <AutoTooltip ghost maxWidth={260} title={text}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              GPU {record.index}
              {text ? `  ${text}` : ''}
            </span>
          </AutoTooltip>
        )
      },
      ...pluginRendered,
      {
        title: intl.formatMessage({ id: 'resources.worker' }),
        dataIndex: 'worker_name',
        sorter: tableSorter(4),
        render: (text: string) => <AutoTooltip ghost>{text}</AutoTooltip>
      },
      {
        title: intl.formatMessage({ id: 'clusters.title' }),
        dataIndex: 'cluster_id',
        sorter: tableSorter(3),
        render: (text: number) => (
          <AutoTooltip ghost>
            {clusterList.find((item) => item.value === text)?.label}
          </AutoTooltip>
        )
      },
      {
        title: intl.formatMessage({ id: 'resources.table.allocation' }),
        dataIndex: 'memory.allocated',
        key: 'allocation',
        render: (_text: number, record: GPUDeviceItem) => {
          const allocated = isAllocated(record);
          return (
            <StatusBadge tone={allocated ? 'info' : 'neutral'} plain>
              {intl.formatMessage({
                id: allocated
                  ? 'resources.gpu.status.allocated'
                  : 'resources.gpu.status.available'
              })}
            </StatusBadge>
          );
        }
      },
      {
        title: intl.formatMessage({ id: 'resources.table.utilization' }),
        dataIndex: 'core.utilization_rate',
        key: 'core.utilization_rate',
        sorter: tableSorter(6),
        width: 140,
        render: (_text: number, record: GPUDeviceItem) =>
          record.core ? (
            <ResourceBar
              percent={_.round(record.core.utilization_rate || 0, 1)}
              color="var(--gpu)"
            />
          ) : (
            '—'
          )
      },
      {
        title: intl.formatMessage({ id: 'resources.table.vram' }),
        dataIndex: 'memory.utilization_rate',
        key: 'memory.utilization_rate',
        sorter: tableSorter(7),
        width: 180,
        render: (_text: number, record: GPUDeviceItem) => {
          const used = Number(record.memory?.used || 0);
          const total = Number(record.memory?.total || 0);
          const allocated = Number(record.memory?.allocated || 0);
          const percent = used
            ? _.round(record.memory?.utilization_rate || 0, 0)
            : total
              ? _.round((allocated / total) * 100, 0)
              : 0;
          return (
            <ResourceBar
              percent={percent}
              color="var(--vram)"
              detail={
                total
                  ? `${convertFileSize(used || allocated, 0)} / ${convertFileSize(total, 0)}`
                  : undefined
              }
            />
          );
        }
      },
      {
        title: `${intl.formatMessage({ id: 'resources.table.temperature' })} (°C)`,
        dataIndex: 'temperature',
        render: (text: number) => {
          const value = text ? _.round(text, 1) : null;
          const hot = value !== null && value >= 80;
          return (
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                color: hot ? 'var(--warning)' : 'var(--text-primary)'
              }}
            >
              {value === null ? '—' : value}
            </span>
          );
        }
      }
    ];
  }, [intl, clusterList, sortOrder, pluginCols]);
};

export default useGPUColumns;
