// columns.ts
import { StatusBadge } from '@/components/console';
import { tableSorter } from '@/config/settings';
import { usePluginListColumns } from '@/plugins/list-extra-columns';
import { AutoTooltip, DropdownButtons } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import ProviderLogo from '../components/provider-logo';
import ProviderModels from '../components/provider-models';
import { rowActionList } from '../config';
import { maasProviderLabelMap } from '../config/providers';
import { MaasProviderItem, ProviderModel } from '../config/types';
const useProviderColumns = (
  handleSelect: (val: string, record: MaasProviderItem) => void,
  onCellClick?: (record: MaasProviderItem, dataIndex: string) => void
): ColumnsType<MaasProviderItem> => {
  const intl = useIntl();
  const pluginCols = usePluginListColumns('maasProviders');

  return useMemo(() => {
    const setActionList = (record: MaasProviderItem) => {
      return rowActionList.filter((action) => {
        if (action.key === 'registerRoute') {
          return record.models && record.models.length > 0;
        }
        return true;
      });
    };
    const pluginRendered = pluginCols.map((c) => ({
      title: intl.formatMessage({ id: c.titleId }),
      dataIndex: c.key,
      span: c.span ?? 4,
      render: (_value: any, record: MaasProviderItem) => c.render(record)
    }));
    return [
      {
        title: intl.formatMessage({ id: 'common.table.name' }),
        dataIndex: 'name',
        sorter: tableSorter(1),
        minWidth: 160,
        span: 5,
        render: (text: string, record: MaasProviderItem) => (
          <>
            <AutoTooltip ghost title={text}>
              <span className="text-primary">{text}</span>
            </AutoTooltip>
            {record.builtin && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  color: 'var(--text-muted)'
                }}
              >
                BuiltIn
              </span>
            )}
          </>
        )
      },
      ...pluginRendered,
      {
        title: intl.formatMessage({ id: 'providers.table.providerName' }),
        dataIndex: ['config', 'type'],
        sorter: false,
        span: 4,
        minWidth: 160,
        render: (value: string) => (
          <div className="flex-center gap-8">
            <ProviderLogo provider={value} />
            <AutoTooltip ghost minWidth={20}>
              {maasProviderLabelMap[value]
                ? intl.formatMessage({ id: maasProviderLabelMap[value] })
                : value}
            </AutoTooltip>
          </div>
        )
      },
      {
        title: intl.formatMessage({ id: 'common.table.status' }),
        dataIndex: 'models',
        key: 'status',
        span: 3,
        minWidth: 100,
        render: (value: ProviderModel[]) => {
          const models = value || [];
          const known = models.filter((item) => item.accessible !== null);
          const ready = known.filter((item) => item.accessible).length;
          if (!models.length) {
            return (
              <StatusBadge tone="neutral" plain>
                {intl.formatMessage({ id: 'providers.status.inactive' })}
              </StatusBadge>
            );
          }
          if (known.length && ready === 0) {
            return (
              <StatusBadge tone="warning" plain>
                {intl.formatMessage({ id: 'providers.status.degraded' })}
              </StatusBadge>
            );
          }
          return (
            <StatusBadge tone="success" plain>
              {intl.formatMessage({ id: 'providers.status.ready' })}
            </StatusBadge>
          );
        }
      },
      {
        title: intl.formatMessage({ id: 'providers.table.endpoint' }),
        dataIndex: 'proxy_url',
        span: 4,
        minWidth: 160,
        render: (_value: string, record: MaasProviderItem) => {
          const endpoint =
            record.config?.openaiCustomUrl ||
            record.config?.claudeCustomUrl ||
            record.proxy_url;
          return (
            <AutoTooltip ghost>
              <span
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 12
                }}
              >
                {endpoint || '—'}
              </span>
            </AutoTooltip>
          );
        }
      },
      {
        title: intl.formatMessage({ id: 'providers.table.models' }),
        dataIndex: 'models',
        span: 3,
        minWidth: 200,
        render: (value: ProviderModel[]) => (
          <ProviderModels dataList={value || []}></ProviderModels>
        )
      },
      {
        title: intl.formatMessage({ id: 'common.table.createTime' }),
        dataIndex: 'created_at',
        sorter: tableSorter(6),
        span: 3,
        render: (value: string) => (
          <AutoTooltip ghost minWidth={20}>
            {dayjs(value).format('YYYY-MM-DD HH:mm:ss')}
          </AutoTooltip>
        )
      },
      {
        title: intl.formatMessage({ id: 'common.table.operation' }),
        dataIndex: 'operations',
        span: 3,
        minWidth: 120,
        render: (value: string, record: MaasProviderItem) => (
          <DropdownButtons
            items={setActionList(record)}
            onSelect={(val) => handleSelect(val, record)}
          ></DropdownButtons>
        )
      }
    ];
  }, [handleSelect, onCellClick, intl, pluginCols]);
};

export default useProviderColumns;
