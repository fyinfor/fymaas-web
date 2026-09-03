import { AutoTooltip, StatusTag } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { ListItem } from '../config/types';

interface ColumnsHookProps {
  onView: (record: ListItem) => void;
  sortOrder: string[];
}

const useAuditLogColumns = ({
  onView,
  sortOrder
}: ColumnsHookProps): ColumnsType<ListItem> => {
  const intl = useIntl();

  return useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'auditLogs.table.time' }),
        dataIndex: 'occurred_at',
        key: 'occurred_at',
        sorter: true,
        width: 180,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <AutoTooltip ghost>
            {text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </AutoTooltip>
        )
      },
      {
        title: intl.formatMessage({ id: 'auditLogs.table.actor' }),
        dataIndex: 'actor_name',
        key: 'actor_name',
        ellipsis: { showTitle: false },
        render: (text: string, record: ListItem) => (
          <AutoTooltip ghost>
            {/* An api key name says the call came from automation rather
                than from the person the key belongs to. */}
            {record.api_key_name
              ? `${text || '-'} (${record.api_key_name})`
              : text || '-'}
          </AutoTooltip>
        )
      },
      {
        title: intl.formatMessage({ id: 'auditLogs.table.action' }),
        dataIndex: 'action',
        key: 'action',
        sorter: true,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <AutoTooltip ghost>
            <span className="text-primary">{text}</span>
          </AutoTooltip>
        )
      },
      {
        title: intl.formatMessage({ id: 'auditLogs.table.resource' }),
        dataIndex: 'resource_name',
        key: 'resource_name',
        ellipsis: { showTitle: false },
        render: (text: string, record: ListItem) => (
          <AutoTooltip ghost>{text || record.resource_id || '-'}</AutoTooltip>
        )
      },
      {
        title: intl.formatMessage({ id: 'auditLogs.table.result' }),
        dataIndex: 'result',
        key: 'result',
        width: 120,
        render: (text: string, record: ListItem) => (
          <StatusTag
            statusValue={{
              status: text === 'success' ? 'success' : 'error',
              text: record.http_status
                ? `${text} · ${record.http_status}`
                : text
            }}
          />
        )
      },
      {
        title: intl.formatMessage({ id: 'auditLogs.table.sourceIp' }),
        dataIndex: 'source_ip',
        key: 'source_ip',
        width: 160,
        ellipsis: { showTitle: false },
        render: (text: string) => <AutoTooltip ghost>{text || '-'}</AutoTooltip>
      },
      {
        title: intl.formatMessage({ id: 'common.table.operation' }),
        key: 'operation',
        dataIndex: 'operation',
        width: 120,
        render: (_text, record) => (
          <Button type="link" size="small" onClick={() => onView(record)}>
            {intl.formatMessage({ id: 'auditLogs.button.detail' })}
          </Button>
        )
      }
    ],
    [onView, sortOrder, intl]
  );
};

export default useAuditLogColumns;
