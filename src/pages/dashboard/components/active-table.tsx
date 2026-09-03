import { activeModelsAtom } from '@/atoms/dashboard';
import { SectionCard, StatusBadge } from '@/components/console';
import { modelCategoriesMap } from '@/pages/llmodels/config';
import { convertFileSize } from '@/utils';
import { AutoTooltip } from '@gpustack/core-ui';
import { history, useIntl } from '@umijs/max';
import { Table } from 'antd';
import { useSetAtom } from 'jotai';
import { useContext, useEffect } from 'react';
import { DashboardContext } from '../config/dashboard-context';
import { formatCompactNumber } from '../utils/format';

const NACategories = [
  modelCategoriesMap.llm,
  modelCategoriesMap.embedding,
  modelCategoriesMap.reranker
];

const ActiveTable = () => {
  const intl = useIntl();
  const data = useContext(DashboardContext).active_models || [];
  const setActiveModels = useSetAtom(activeModelsAtom);

  useEffect(() => {
    setActiveModels(data);
  }, [data, setActiveModels]);

  const modelColumns = [
    {
      title: intl.formatMessage({ id: 'common.table.name' }),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text: any, record: any) => {
        const label = record.provider_name
          ? `${record.provider_name}/${text}`
          : text;
        return (
          <AutoTooltip ghost title={label}>
            <span
              className="text-primary"
              style={{ cursor: 'pointer' }}
              onClick={() => history.push('/models/deployments')}
            >
              {label}
            </span>
          </AutoTooltip>
        );
      }
    },
    {
      title: intl.formatMessage({ id: 'common.table.status' }),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: () => (
        <StatusBadge tone="success">
          {intl.formatMessage({ id: 'dashboard.status.running' })}
        </StatusBadge>
      )
    },
    {
      title: intl.formatMessage({ id: 'models.form.replicas' }),
      dataIndex: 'instance_count',
      key: 'instance_count',
      width: 100,
      render(text: any, record: any) {
        if (record.provider_name) {
          return <span>{intl.formatMessage({ id: 'dashboard.na' })}</span>;
        }
        return (
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{text}</span>
        );
      }
    },
    {
      title: intl.formatMessage({ id: 'dashboard.allocatevram' }),
      dataIndex: 'resource_claim.memory',
      key: 'vram',
      ellipsis: true,
      render: (text: any, record: any) => {
        return record.provider_name ? (
          <span>{intl.formatMessage({ id: 'dashboard.na' })}</span>
        ) : (
          <AutoTooltip ghost>
            {convertFileSize(record.resource_claim?.vram || 0)} /{' '}
            {convertFileSize(record.resource_claim?.ram || 0)}
          </AutoTooltip>
        );
      }
    },
    {
      title: intl.formatMessage({ id: 'dashboard.tokens' }),
      dataIndex: 'token_count',
      key: 'token_count',
      ellipsis: true,
      render: (text: any, record: any) => {
        let val = text;
        if (!text) {
          val = !NACategories.includes(record.categories?.[0]) ? null : 0;
        }
        return (
          <AutoTooltip ghost>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {val === null
                ? intl.formatMessage({ id: 'dashboard.na' })
                : formatCompactNumber(val)}
            </span>
          </AutoTooltip>
        );
      }
    }
  ];

  const generateRowKey = (record: any) => {
    return record.provider_name
      ? `${record.provider_name}/${record.name}`
      : record.name;
  };

  return (
    <SectionCard
      title={intl.formatMessage({ id: 'dashboard.activeDeployments' })}
      extra={
        <a
          onClick={() => history.push('/models/deployments')}
          style={{ fontSize: 12 }}
        >
          {intl.formatMessage({ id: 'dashboard.viewAllDeployments' })}
        </a>
      }
      bodyStyle={{ margin: '0 -8px' }}
    >
      <Table
        columns={modelColumns}
        dataSource={data}
        pagination={false}
        size="middle"
        rowKey={generateRowKey}
      />
    </SectionCard>
  );
};

export default ActiveTable;
