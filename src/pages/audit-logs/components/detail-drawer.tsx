import { GSDrawer } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Descriptions, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { ListItem } from '../config/types';

interface DetailDrawerProps {
  open: boolean;
  data?: ListItem | null;
  onClose: () => void;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ open, data, onClose }) => {
  const intl = useIntl();

  const items = React.useMemo(() => {
    if (!data) {
      return [];
    }

    const rows: { key: string; label: string; children: React.ReactNode }[] = [
      {
        key: 'occurred_at',
        label: intl.formatMessage({ id: 'auditLogs.table.time' }),
        children: data.occurred_at
          ? dayjs(data.occurred_at).format('YYYY-MM-DD HH:mm:ss')
          : '-'
      },
      {
        key: 'action',
        label: intl.formatMessage({ id: 'auditLogs.table.action' }),
        children: data.action
      },
      {
        key: 'actor',
        label: intl.formatMessage({ id: 'auditLogs.table.actor' }),
        children: data.actor_name || '-'
      },
      {
        key: 'actor_type',
        label: intl.formatMessage({ id: 'auditLogs.detail.actorType' }),
        children: data.actor_type || '-'
      },
      {
        key: 'api_key',
        label: intl.formatMessage({ id: 'auditLogs.detail.apiKey' }),
        children: data.api_key_name || '-'
      },
      {
        key: 'org',
        label: intl.formatMessage({ id: 'auditLogs.detail.organization' }),
        children: data.org_name || data.org_principal_id || '-'
      },
      {
        key: 'resource',
        label: intl.formatMessage({ id: 'auditLogs.table.resource' }),
        children:
          [data.resource_type, data.resource_name || data.resource_id]
            .filter(Boolean)
            .join(' · ') || '-'
      },
      {
        key: 'request',
        label: intl.formatMessage({ id: 'auditLogs.detail.request' }),
        children:
          `${data.http_method || ''} ${data.http_path || ''}`.trim() || '-'
      },
      {
        key: 'result',
        label: intl.formatMessage({ id: 'auditLogs.table.result' }),
        children: [data.result, data.http_status].filter(Boolean).join(' · ')
      },
      {
        key: 'source_ip',
        label: intl.formatMessage({ id: 'auditLogs.table.sourceIp' }),
        children: data.source_ip || '-'
      },
      {
        key: 'user_agent',
        label: intl.formatMessage({ id: 'auditLogs.detail.userAgent' }),
        children: data.user_agent || '-'
      },
      {
        key: 'request_id',
        label: intl.formatMessage({ id: 'auditLogs.detail.requestId' }),
        children: data.request_id ? (
          <Typography.Text copyable>{data.request_id}</Typography.Text>
        ) : (
          '-'
        )
      }
    ];

    if (data.error_message) {
      rows.push({
        key: 'error_message',
        label: intl.formatMessage({ id: 'auditLogs.detail.error' }),
        children: data.error_message
      });
    }

    if (data.changes) {
      rows.push({
        key: 'changes',
        label: intl.formatMessage({ id: 'auditLogs.detail.changes' }),
        children: (
          <pre
            style={{
              margin: 0,
              maxHeight: 320,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {JSON.stringify(data.changes, null, 2)}
          </pre>
        )
      });
    }

    return rows;
  }, [data, intl]);

  return (
    <GSDrawer
      title={intl.formatMessage({ id: 'auditLogs.detail.title' })}
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
