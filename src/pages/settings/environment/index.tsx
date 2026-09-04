import { MetaChip, StatusBadge } from '@/components/console';
import {
  queryRuntimeSettings,
  updateRuntimeSettings,
  type RuntimeFieldSources,
  type RuntimeOverlay,
  type RuntimePreview,
  type RuntimeSource
} from '@/enterprise/runtime-settings/apis';
import PageBox from '@/pages/_components/page-box';
import SettingsSection from '@/pages/profile/components/settings-section';
import { useIntl } from '@umijs/max';
import { Alert, Button, Form, Input, Modal, Space, Spin, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';

const FIELDS: (keyof RuntimeOverlay)[] = [
  'system_default_container_registry',
  'image_repo',
  'image_name_override',
  'operator_image',
  'benchmark_image_repo',
  'namespace',
  'gateway_namespace',
  'runtime_container_namespace',
  'tools_download_base_url'
];

const emptyOverlay = (): RuntimeOverlay =>
  Object.fromEntries(FIELDS.map((field) => [field, null])) as RuntimeOverlay;

const useStyles = createStyles(({ css }) => ({
  wrapper: css`
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 8px 0 40px;
  `,
  description: css`
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 20px;
    color: var(--ant-color-text-tertiary);
  `,
  notice: css`
    margin-bottom: 32px;
  `,
  hint: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 12px;
    line-height: 18px;
    color: var(--ant-color-text-tertiary);
  `,
  previewList: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  `,
  previewItem: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--console-bg-muted, var(--ant-color-fill-quaternary));
  `,
  previewLabel: css`
    font-size: 12px;
    color: var(--ant-color-text-tertiary);
  `,
  previewValue: css`
    font-size: 13px;
    line-height: 20px;
    word-break: break-all;
    font-family: var(
      --font-mono,
      ui-monospace,
      SFMono-Regular,
      Menlo,
      monospace
    );
    color: var(--ant-color-text);
  `,
  actions: css`
    margin-top: 40px;
  `
}));

const sourceTone = (source?: RuntimeSource) => {
  if (source === 'settings') return 'info' as const;
  if (source === 'cli') return 'success' as const;
  return 'neutral' as const;
};

const EnvironmentSettings: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [form] = Form.useForm<RuntimeOverlay>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [effective, setEffective] = useState<RuntimeOverlay>({});
  const [sources, setSources] = useState<Partial<RuntimeFieldSources>>({});
  const [preview, setPreview] = useState<RuntimePreview | null>(null);

  const applyResponse = (data: {
    overlay: RuntimeOverlay;
    effective: RuntimeOverlay;
    sources: RuntimeFieldSources;
    preview: RuntimePreview;
  }) => {
    const overlay = Object.fromEntries(
      FIELDS.map((field) => [field, data.overlay?.[field] ?? ''])
    );
    form.setFieldsValue(overlay);
    setEffective(data.effective || {});
    setSources(data.sources || {});
    setPreview(data.preview);
  };

  useEffect(() => {
    const load = async () => {
      try {
        applyResponse(await queryRuntimeSettings());
      } catch {
        // Global handler already toasted.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    const payload: RuntimeOverlay = {};
    for (const field of FIELDS) {
      const value = values[field];
      payload[field] = value === undefined || value === '' ? null : value;
    }
    setSaving(true);
    try {
      applyResponse(await updateRuntimeSettings(payload));
      message.success(intl.formatMessage({ id: 'runtime.message.saved' }));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'runtime.reset' }),
      content: intl.formatMessage({ id: 'runtime.reset.confirm' }),
      okText: intl.formatMessage({ id: 'runtime.reset.ok' }),
      onOk: async () => {
        const data = await updateRuntimeSettings(emptyOverlay());
        applyResponse(data);
        message.success(intl.formatMessage({ id: 'runtime.message.saved' }));
      }
    });
  };

  const fieldHint = (field: keyof RuntimeOverlay) => {
    const current = effective[field];
    const source = sources[field];
    return (
      <div className={styles.hint}>
        <StatusBadge tone={sourceTone(source)} plain>
          {intl.formatMessage({
            id: `runtime.source.${source || 'default'}`
          })}
        </StatusBadge>
        {current ? (
          <span>
            {intl.formatMessage(
              { id: 'runtime.effective' },
              { value: current }
            )}
          </span>
        ) : null}
      </div>
    );
  };

  const previewRows: { key: keyof RuntimePreview; labelId: string }[] = [
    { key: 'worker_image', labelId: 'runtime.preview.worker' },
    { key: 'runtime_pause', labelId: 'runtime.preview.pause' },
    { key: 'runner_example', labelId: 'runtime.preview.runner' },
    { key: 'operator_image', labelId: 'runtime.preview.operator' }
  ];

  return (
    <PageBox>
      <Spin spinning={loading}>
        <div className={styles.wrapper}>
          <p className={styles.description}>
            {intl.formatMessage({ id: 'runtime.page.description' })}
          </p>
          <Alert
            className={styles.notice}
            type="info"
            showIcon
            message={intl.formatMessage({ id: 'runtime.notice.workers' })}
          />
          <Form form={form} layout="vertical" requiredMark={false}>
            <SettingsSection
              title={intl.formatMessage({ id: 'runtime.section.images' })}
              description={intl.formatMessage({
                id: 'runtime.section.images.description'
              })}
            >
              <Form.Item
                name="system_default_container_registry"
                label={intl.formatMessage({ id: 'runtime.form.registry' })}
                extra={fieldHint('system_default_container_registry')}
              >
                <Input
                  allowClear
                  placeholder={
                    effective.system_default_container_registry ||
                    intl.formatMessage({ id: 'runtime.form.registry.holder' })
                  }
                />
              </Form.Item>
              <Form.Item
                name="image_repo"
                label={intl.formatMessage({ id: 'runtime.form.imageRepo' })}
                extra={fieldHint('image_repo')}
              >
                <Input
                  allowClear
                  placeholder={
                    effective.image_repo ||
                    intl.formatMessage({ id: 'runtime.form.imageRepo.holder' })
                  }
                />
              </Form.Item>
              <Form.Item
                name="image_name_override"
                label={intl.formatMessage({
                  id: 'runtime.form.imageNameOverride'
                })}
                extra={fieldHint('image_name_override')}
              >
                <Input
                  allowClear
                  placeholder={intl.formatMessage({
                    id: 'runtime.form.imageNameOverride.holder'
                  })}
                />
              </Form.Item>
              <Form.Item
                name="operator_image"
                label={intl.formatMessage({ id: 'runtime.form.operatorImage' })}
                extra={fieldHint('operator_image')}
              >
                <Input
                  allowClear
                  placeholder={
                    effective.operator_image ||
                    intl.formatMessage({
                      id: 'runtime.form.operatorImage.holder'
                    })
                  }
                />
              </Form.Item>
              <Form.Item
                name="benchmark_image_repo"
                label={intl.formatMessage({
                  id: 'runtime.form.benchmarkImage'
                })}
                extra={fieldHint('benchmark_image_repo')}
              >
                <Input
                  allowClear
                  placeholder={effective.benchmark_image_repo || undefined}
                />
              </Form.Item>
            </SettingsSection>
            <SettingsSection
              title={intl.formatMessage({ id: 'runtime.section.namespaces' })}
              description={intl.formatMessage({
                id: 'runtime.section.namespaces.description'
              })}
            >
              <Form.Item
                name="runtime_container_namespace"
                label={intl.formatMessage({
                  id: 'runtime.form.runtimeNamespace'
                })}
                extra={fieldHint('runtime_container_namespace')}
              >
                <Input
                  allowClear
                  placeholder={
                    effective.runtime_container_namespace ||
                    intl.formatMessage({
                      id: 'runtime.form.runtimeNamespace.holder'
                    })
                  }
                />
              </Form.Item>
              <Form.Item
                name="namespace"
                label={intl.formatMessage({ id: 'runtime.form.namespace' })}
                extra={fieldHint('namespace')}
              >
                <Input
                  allowClear
                  placeholder={
                    effective.namespace ||
                    intl.formatMessage({ id: 'runtime.form.namespace.holder' })
                  }
                />
              </Form.Item>
              <Form.Item
                name="gateway_namespace"
                label={intl.formatMessage({
                  id: 'runtime.form.gatewayNamespace'
                })}
                extra={fieldHint('gateway_namespace')}
              >
                <Input
                  allowClear
                  placeholder={effective.gateway_namespace || undefined}
                />
              </Form.Item>
            </SettingsSection>
            <SettingsSection
              title={intl.formatMessage({ id: 'runtime.section.downloads' })}
              description={intl.formatMessage({
                id: 'runtime.section.downloads.description'
              })}
            >
              <Form.Item
                name="tools_download_base_url"
                label={intl.formatMessage({ id: 'runtime.form.toolsUrl' })}
                extra={fieldHint('tools_download_base_url')}
                rules={[
                  {
                    validator: async (_, value) => {
                      if (!value) return;
                      try {
                        const parsed = new URL(value);
                        if (
                          parsed.protocol === 'http:' ||
                          parsed.protocol === 'https:'
                        ) {
                          return;
                        }
                      } catch {
                        // fall through
                      }
                      throw new Error(
                        intl.formatMessage({
                          id: 'runtime.form.toolsUrl.invalid'
                        })
                      );
                    }
                  }
                ]}
              >
                <Input
                  allowClear
                  placeholder={intl.formatMessage({
                    id: 'runtime.form.toolsUrl.holder'
                  })}
                />
              </Form.Item>
            </SettingsSection>
            <SettingsSection
              title={intl.formatMessage({ id: 'runtime.section.preview' })}
              description={intl.formatMessage({
                id: 'runtime.section.preview.description'
              })}
            >
              <ul className={styles.previewList}>
                {previewRows.map((row) => (
                  <li key={row.key} className={styles.previewItem}>
                    <span className={styles.previewLabel}>
                      {intl.formatMessage({ id: row.labelId })}
                    </span>
                    <span className={styles.previewValue}>
                      {preview?.[row.key] || '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </SettingsSection>
            <div className={styles.actions}>
              <Space>
                <Button type="primary" loading={saving} onClick={handleSave}>
                  {intl.formatMessage({ id: 'common.button.save' })}
                </Button>
                <Button onClick={handleReset}>
                  {intl.formatMessage({ id: 'runtime.reset' })}
                </Button>
                {Object.values(sources).some((item) => item === 'settings') ? (
                  <MetaChip>
                    {intl.formatMessage({ id: 'runtime.source.settings' })}
                  </MetaChip>
                ) : null}
              </Space>
            </div>
          </Form>
        </div>
      </Spin>
    </PageBox>
  );
};

EnvironmentSettings.displayName = 'EnvironmentSettings';

export default EnvironmentSettings;
