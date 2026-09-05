import { GSDrawer } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Descriptions, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { ListItem, LogKind } from '../config/types';

interface DetailDrawerProps {
  kind: LogKind;
  open: boolean;
  data?: ListItem | null;
  onClose: () => void;
}

const formatTime = (value?: string | null) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';

const DetailDrawer: React.FC<DetailDrawerProps> = ({
  kind,
  open,
  data,
  onClose
}) => {
  const intl = useIntl();

  const items = React.useMemo(() => {
    if (!data) {
      return [];
    }

    const operationLabel = data.operation
      ? intl.formatMessage({
          id: `requestLogs.operation.${data.operation}`,
          defaultMessage: data.operation
        })
      : '-';

    return [
      {
        key: 'started_at',
        label: intl.formatMessage({ id: 'requestLogs.table.submitTime' }),
        children: formatTime(data.started_at || data.created_at)
      },
      {
        key: 'completed_at',
        label: intl.formatMessage({ id: 'requestLogs.table.finishTime' }),
        children: formatTime(data.completed_at)
      },
      {
        key: 'user',
        label: intl.formatMessage({ id: 'requestLogs.table.user' }),
        children: data.user_name || '-'
      },
      {
        key: 'api_key',
        label: intl.formatMessage({ id: 'requestLogs.table.apiKey' }),
        children: data.api_key_name || '-'
      },
      {
        key: 'access_key',
        label: intl.formatMessage({ id: 'requestLogs.detail.accessKey' }),
        children: data.access_key ? (
          <Typography.Text copyable>{data.access_key}</Typography.Text>
        ) : (
          '-'
        )
      },
      {
        key: 'model',
        label: intl.formatMessage({ id: 'requestLogs.table.model' }),
        children: data.model_name ? (
          <Typography.Text copyable>{data.model_name}</Typography.Text>
        ) : (
          '-'
        )
      },
      {
        key: 'route',
        label: intl.formatMessage({ id: 'requestLogs.detail.route' }),
        children: data.model_route_name || '-'
      },
      {
        key: 'cluster',
        label: intl.formatMessage({ id: 'requestLogs.detail.cluster' }),
        children: data.cluster_name || '-'
      },
      {
        key: 'operation',
        label: intl.formatMessage({ id: 'requestLogs.table.operation' }),
        children: operationLabel
      },
      {
        key: 'status',
        label: intl.formatMessage({ id: 'requestLogs.table.status' }),
        children: intl.formatMessage({
          id: `requestLogs.status.${data.status}`,
          defaultMessage: data.status
        })
      },
      {
        key: 'prompt',
        label: intl.formatMessage({ id: 'requestLogs.detail.promptTokens' }),
        children: data.prompt_token_count
      },
      {
        key: 'completion',
        label: intl.formatMessage({
          id: 'requestLogs.detail.completionTokens'
        }),
        children: data.completion_token_count
      },
      {
        key: 'cached',
        label: intl.formatMessage({ id: 'requestLogs.detail.cachedTokens' }),
        children: data.prompt_cached_token_count
      },
      {
        key: 'total',
        label: intl.formatMessage({ id: 'requestLogs.table.tokens' }),
        children: data.total_tokens
      },
      {
        key: 'ttft',
        label: intl.formatMessage({ id: 'requestLogs.table.ttft' }),
        children:
          data.ttft_ms === null || data.ttft_ms === undefined
            ? '-'
            : `${data.ttft_ms} ms`
      },
      {
        key: 'latency',
        label: intl.formatMessage({ id: 'requestLogs.table.latency' }),
        children:
          data.latency_ms === null || data.latency_ms === undefined
            ? '-'
            : `${data.latency_ms} ms`
      }
    ];
  }, [data, intl, kind]);

  return (
    <GSDrawer
      title={intl.formatMessage({
        id:
          kind === 'task'
            ? 'requestLogs.detail.taskTitle'
            : 'requestLogs.detail.title'
      })}
      open={open}
      destroyOnHidden={true}
      onClose={onClose}
      styles={{ wrapper: { width: 720 } }}
    >
      <Descriptions column={1} bordered size="small" items={items} />
    </GSDrawer>
  );
};

export default DetailDrawer;
