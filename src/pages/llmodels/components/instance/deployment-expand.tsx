import { StatusBadge } from '@/components/console';
import { ListItem as WorkerListItem } from '@/pages/resources/config/types';
import { useIntl } from '@umijs/max';
import { Segmented } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { generateSource } from '../../config/button-actions';
import { ListItem, ModelInstanceListItem } from '../../config/types';
import Instances from './instances';

const dash = '—';

const Field: React.FC<{
  label: React.ReactNode;
  children?: React.ReactNode;
}> = ({ label, children }) => (
  <div
    style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}
  >
    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
    <span
      style={{
        fontSize: 13,
        color: 'var(--text-primary)',
        fontWeight: 500,
        wordBreak: 'break-all'
      }}
    >
      {children ?? dash}
    </span>
  </div>
);

const getDeployStatus = (
  record: ListItem | undefined,
  intl: ReturnType<typeof useIntl>
) => {
  if (!record?.replicas && !record?.ready_replicas) {
    return {
      tone: 'neutral' as const,
      text: intl.formatMessage({ id: 'models.status.stopped' })
    };
  }
  if (record.replicas > 0 && !record.ready_replicas) {
    return {
      tone: 'info' as const,
      text: intl.formatMessage({ id: 'models.status.deploying' })
    };
  }
  if (record.ready_replicas > 0 && record.replicas > 0) {
    return {
      tone: 'success' as const,
      text: intl.formatMessage({ id: 'models.status.running' })
    };
  }
  return {
    tone: 'warning' as const,
    text: intl.formatMessage({ id: 'models.status.deploying' })
  };
};

interface DeploymentExpandProps {
  list: ModelInstanceListItem[];
  workerList: WorkerListItem[];
  modelData?: ListItem;
  currentExpanded?: string;
  gridTemplate?: string;
  prefixWidth?: number;
  columns?: any[];
  handleChildSelect: (val: string, item: ModelInstanceListItem) => void;
}

const DeploymentExpand: React.FC<DeploymentExpandProps> = ({
  modelData,
  ...instanceProps
}) => {
  const intl = useIntl();
  const [tab, setTab] = useState('replicas');
  const status = getDeployStatus(modelData, intl);
  const source = modelData ? generateSource(modelData) : '';
  const parameters = (
    modelData as { backend_parameters?: string[] } | undefined
  )?.backend_parameters;
  const env = (modelData as { env?: Record<string, string> } | undefined)?.env;
  const envEntries = env ? Object.entries(env) : [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        padding: '4px 0 8px'
      }}
    >
      <Segmented
        size="small"
        value={tab}
        onChange={(value) => setTab(String(value))}
        options={[
          {
            label: intl.formatMessage({ id: 'kvCache.detail.overview' }),
            value: 'overview'
          },
          {
            label: intl.formatMessage({ id: 'models.form.replicas' }),
            value: 'replicas'
          },
          {
            label: intl.formatMessage({ id: 'models.form.configurations' }),
            value: 'configuration'
          }
        ]}
      />
      {tab === 'replicas' && (
        <Instances modelData={modelData} {...instanceProps} />
      )}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 16
            }}
          >
            <Field label={intl.formatMessage({ id: 'common.table.status' })}>
              <StatusBadge tone={status.tone} plain>
                {status.text}
              </StatusBadge>
            </Field>
            <Field label={intl.formatMessage({ id: 'models.form.replicas' })}>
              {`${modelData?.ready_replicas ?? 0} / ${modelData?.replicas ?? 0}`}
            </Field>
            <Field label={intl.formatMessage({ id: 'models.form.backend' })}>
              {modelData?.backend
                ? `${modelData.backend}${
                    modelData.backend_version
                      ? ` ${modelData.backend_version}`
                      : ''
                  }`
                : dash}
            </Field>
            <Field label={intl.formatMessage({ id: 'models.form.source' })}>
              {source || dash}
            </Field>
            <Field
              label={intl.formatMessage({ id: 'models.table.accessScope' })}
            >
              {modelData?.access_policy || dash}
            </Field>
            <Field
              label={intl.formatMessage({ id: 'common.table.createTime' })}
            >
              {modelData?.created_at
                ? dayjs(modelData.created_at).format('YYYY-MM-DD HH:mm:ss')
                : dash}
            </Field>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
              gap: 16,
              paddingTop: 4,
              borderTop: '1px solid var(--console-border)'
            }}
          >
            <Field
              label={intl.formatMessage({ id: 'dashboard.inference.requests' })}
            >
              {dash}
            </Field>
            <Field label={intl.formatMessage({ id: 'benchmark.table.tps' })}>
              {dash}
            </Field>
            <Field label={intl.formatMessage({ id: 'benchmark.table.ttft' })}>
              {dash}
            </Field>
            <Field label={intl.formatMessage({ id: 'benchmark.table.tpot' })}>
              {dash}
            </Field>
            <Field
              label={intl.formatMessage({ id: 'dashboard.inference.latency' })}
            >
              {dash}
            </Field>
            <Field
              label={intl.formatMessage({
                id: 'dashboard.inference.errorRate'
              })}
            >
              {dash}
            </Field>
          </div>
        </div>
      )}
      {tab === 'configuration' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16
          }}
        >
          <Field label={intl.formatMessage({ id: 'models.form.backend' })}>
            {modelData?.backend || dash}
          </Field>
          <Field
            label={intl.formatMessage({ id: 'models.form.backendVersion' })}
          >
            {modelData?.backend_version || dash}
          </Field>
          <Field label={intl.formatMessage({ id: 'models.form.replicas' })}>
            {modelData?.replicas ?? dash}
          </Field>
          <Field
            label={intl.formatMessage({ id: 'models.form.backend_parameters' })}
          >
            {parameters?.length ? parameters.join(' ') : dash}
          </Field>
          <Field label="ENV">
            {envEntries.length
              ? envEntries.map(([key, value]) => `${key}=${value}`).join(' ')
              : dash}
          </Field>
        </div>
      )}
    </div>
  );
};

export default DeploymentExpand;
