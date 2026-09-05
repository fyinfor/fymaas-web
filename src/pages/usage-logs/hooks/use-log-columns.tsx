import { StatusBadge, statusTone } from '@/components/console';
import { AutoTooltip } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button, Typography } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { ListItem, LogKind } from '../config/types';

interface ColumnsHookProps {
  kind: LogKind;
  showUser: boolean;
  onView: (record: ListItem) => void;
  sortOrder: string[];
}

const formatTime = (value?: string | null) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';

const formatMs = (value?: number | null) =>
  value === null || value === undefined ? '-' : `${value}`;

const useLogColumns = ({
  kind,
  showUser,
  onView,
  sortOrder
}: ColumnsHookProps): ColumnsType<ListItem> => {
  const intl = useIntl();

  return useMemo(() => {
    const operationTitle = intl.formatMessage({
      id: 'requestLogs.table.operation'
    });
    const columns: ColumnsType<ListItem> = [
      {
        title: intl.formatMessage({
          id:
            kind === 'task'
              ? 'requestLogs.table.submitTime'
              : 'requestLogs.table.time'
        }),
        dataIndex: kind === 'task' ? 'started_at' : 'completed_at',
        key: kind === 'task' ? 'started_at' : 'completed_at',
        sorter: true,
        width: 180,
        ellipsis: { showTitle: false },
        render: (_text: string, record: ListItem) => (
          <AutoTooltip ghost>
            {formatTime(
              kind === 'task'
                ? record.started_at || record.created_at
                : record.completed_at || record.started_at || record.created_at
            )}
          </AutoTooltip>
        )
      }
    ];

    if (kind === 'task') {
      columns.push({
        title: intl.formatMessage({ id: 'requestLogs.table.finishTime' }),
        dataIndex: 'completed_at',
        key: 'completed_at',
        sorter: true,
        width: 180,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <AutoTooltip ghost>{formatTime(text)}</AutoTooltip>
        )
      });
      columns.push({
        title: intl.formatMessage({ id: 'requestLogs.table.duration' }),
        dataIndex: 'latency_ms',
        key: 'latency_ms',
        sorter: true,
        width: 120,
        render: (value: number) => formatMs(value)
      });
    }

    if (showUser) {
      columns.push({
        title: intl.formatMessage({ id: 'requestLogs.table.user' }),
        dataIndex: 'user_name',
        key: 'user_name',
        sorter: true,
        width: 140,
        ellipsis: { showTitle: false },
        render: (text: string) => <AutoTooltip ghost>{text || '-'}</AutoTooltip>
      });
    }

    columns.push(
      {
        title: intl.formatMessage({ id: 'requestLogs.table.model' }),
        dataIndex: 'model_name',
        key: 'model_name',
        sorter: true,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <AutoTooltip ghost>
            <Typography.Text copyable={!!text}>{text || '-'}</Typography.Text>
          </AutoTooltip>
        )
      },
      {
        title: operationTitle,
        dataIndex: 'operation',
        key: 'operation',
        width: 160,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <AutoTooltip ghost>
            {text
              ? intl.formatMessage({
                  id: `requestLogs.operation.${text}`,
                  defaultMessage: text
                })
              : '-'}
          </AutoTooltip>
        )
      },
      {
        title: intl.formatMessage({ id: 'requestLogs.table.apiKey' }),
        dataIndex: 'api_key_name',
        key: 'api_key_name',
        width: 160,
        ellipsis: { showTitle: false },
        render: (text: string, record: ListItem) => (
          <AutoTooltip ghost>{text || record.access_key || '-'}</AutoTooltip>
        )
      }
    );

    if (kind === 'usage') {
      columns.push(
        {
          title: intl.formatMessage({ id: 'requestLogs.table.tokens' }),
          dataIndex: 'total_tokens',
          key: 'total_tokens',
          width: 160,
          render: (_text, record) =>
            `${record.prompt_token_count} / ${record.completion_token_count}`
        },
        {
          title: intl.formatMessage({ id: 'requestLogs.table.ttft' }),
          dataIndex: 'ttft_ms',
          key: 'ttft_ms',
          sorter: true,
          width: 110,
          render: (value: number) => formatMs(value)
        },
        {
          title: intl.formatMessage({ id: 'requestLogs.table.latency' }),
          dataIndex: 'latency_ms',
          key: 'latency_ms',
          sorter: true,
          width: 120,
          render: (value: number) => formatMs(value)
        }
      );
    } else {
      columns.push({
        title: intl.formatMessage({ id: 'requestLogs.table.progress' }),
        dataIndex: 'completed',
        key: 'progress',
        width: 100,
        render: (completed: boolean) => (completed ? '100%' : '—')
      });
    }

    columns.push(
      {
        title: intl.formatMessage({ id: 'requestLogs.table.status' }),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (text: string) => (
          <StatusBadge
            tone={statusTone(text === 'completed' ? 'success' : 'warning')}
            plain
          >
            {intl.formatMessage({
              id: `requestLogs.status.${text}`,
              defaultMessage: text
            })}
          </StatusBadge>
        )
      },
      {
        title: intl.formatMessage({ id: 'common.table.operation' }),
        key: 'actions',
        dataIndex: 'actions',
        width: 100,
        render: (_text, record) => (
          <Button type="link" size="small" onClick={() => onView(record)}>
            {intl.formatMessage({ id: 'requestLogs.button.detail' })}
          </Button>
        )
      }
    );

    return columns;
  }, [intl, kind, onView, showUser, sortOrder]);
};

export default useLogColumns;
