import {
  queryModelsCatalogSettings,
  resolveApiOrigin,
  updateModelsCatalogSettings,
  type ModelsCatalogSettings
} from '@/enterprise/models-catalog/apis';
import PageBox from '@/pages/_components/page-box';
import SettingsSection from '@/pages/profile/components/settings-section';
import { CopyButton } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button, Form, Input, Spin, Switch, Tabs, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useMemo, useState } from 'react';

const URL_PATTERN = /^https?:\/\/.+/i;
const PLACEHOLDER_KEY = 'YOUR_API_KEY';

type ExampleKind = 'public' | 'compat';

const useStyles = createStyles(({ css }) => ({
  wrapper: css`
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 8px 0 40px;
  `,
  description: css`
    margin: 0 0 32px;
    font-size: 13px;
    line-height: 20px;
    color: var(--ant-color-text-tertiary);
  `,
  pathHint: css`
    margin: 0 0 8px;
    font-size: 12px;
    line-height: 18px;
    color: var(--ant-color-text-tertiary);
    font-family: var(
      --font-mono,
      ui-monospace,
      SFMono-Regular,
      Menlo,
      monospace
    );
  `,
  exampleHint: css`
    margin: 0 0 12px;
    font-size: 12px;
    line-height: 18px;
    color: var(--ant-color-text-tertiary);
  `,
  codeBlock: css`
    position: relative;
    border: 1px solid var(--ant-color-border);
    border-radius: 8px;
    background: var(--ant-color-fill-quaternary);
    pre {
      margin: 0;
      padding: 16px 44px 16px 16px;
      overflow: auto;
      font-size: 12px;
      line-height: 1.65;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      white-space: pre;
    }
    .copy {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  `,
  actions: css`
    margin-top: 40px;
  `
}));

const buildPublicExample = (origin: string, path: string) =>
  `curl -X GET "${origin}${path}" \\
  -H "Accept: application/json"`;

const buildCompatExample = (origin: string, path: string) =>
  `curl -X GET "${origin}${path}" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer ${PLACEHOLDER_KEY}"`;

const TokenServiceSettings: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exampleKind, setExampleKind] = useState<ExampleKind>('public');
  const [paths, setPaths] = useState({
    public_models_path: '/api/models',
    compat_models_path: '/v1/models'
  });
  const watchedEndpoint = Form.useWatch('api_endpoint', form);
  const publicEnabled = Form.useWatch('public_enabled', form);

  const apiOrigin = useMemo(
    () => resolveApiOrigin(watchedEndpoint, window.location.origin),
    [watchedEndpoint]
  );

  const examples = useMemo(
    () => ({
      public: buildPublicExample(apiOrigin, paths.public_models_path),
      compat: buildCompatExample(apiOrigin, paths.compat_models_path)
    }),
    [apiOrigin, paths.compat_models_path, paths.public_models_path]
  );

  const applyValues = (data: ModelsCatalogSettings) => {
    form.setFieldsValue({
      public_enabled: data.public_enabled !== false,
      ready_only: data.ready_only !== false,
      public_access_only: !!data.public_access_only,
      api_endpoint: data.api_endpoint || '',
      api_docs_url: data.api_docs_url || ''
    });
    setPaths({
      public_models_path: data.public_models_path || '/api/models',
      compat_models_path: data.compat_models_path || '/v1/models'
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        applyValues(await queryModelsCatalogSettings());
      } catch {
        form.setFieldsValue({
          public_enabled: true,
          ready_only: true,
          public_access_only: false
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (publicEnabled === false && exampleKind === 'public') {
      setExampleKind('compat');
    }
  }, [exampleKind, publicEnabled]);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      applyValues(
        await updateModelsCatalogSettings({
          public_enabled: !!values.public_enabled,
          ready_only: !!values.ready_only,
          public_access_only: !!values.public_access_only,
          api_endpoint: values.api_endpoint || '',
          api_docs_url: values.api_docs_url || ''
        })
      );
      message.success(intl.formatMessage({ id: 'tokenService.message.saved' }));
    } finally {
      setSaving(false);
    }
  };

  const urlRule = {
    validator: async (_: unknown, value?: string) => {
      if (!value) return;
      if (!URL_PATTERN.test(value.trim())) {
        throw new Error(
          intl.formatMessage({ id: 'tokenService.form.url.invalid' })
        );
      }
    }
  };

  const activeExample: ExampleKind =
    publicEnabled === false && exampleKind === 'public'
      ? 'compat'
      : exampleKind;

  const exampleItems = [
    ...(publicEnabled === false
      ? []
      : [
          {
            key: 'public' as const,
            label: intl.formatMessage({
              id: 'tokenService.examples.public'
            })
          }
        ]),
    {
      key: 'compat' as const,
      label: intl.formatMessage({
        id: 'tokenService.examples.compat'
      })
    }
  ];

  return (
    <PageBox>
      <Spin spinning={loading}>
        <div className={styles.wrapper}>
          <p className={styles.description}>
            {intl.formatMessage({ id: 'tokenService.page.description' })}
          </p>
          <Form form={form} layout="vertical" requiredMark={false}>
            <SettingsSection
              title={intl.formatMessage({ id: 'tokenService.section.catalog' })}
              description={intl.formatMessage({
                id: 'tokenService.section.catalog.description'
              })}
            >
              <p className={styles.pathHint}>
                {intl.formatMessage(
                  { id: 'tokenService.paths' },
                  {
                    compat: paths.compat_models_path,
                    pub: paths.public_models_path
                  }
                )}
              </p>
              <Form.Item
                name="public_enabled"
                label={intl.formatMessage({
                  id: 'tokenService.form.publicEnabled'
                })}
                extra={intl.formatMessage({
                  id: 'tokenService.form.publicEnabled.help'
                })}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="ready_only"
                label={intl.formatMessage({
                  id: 'tokenService.form.readyOnly'
                })}
                extra={intl.formatMessage({
                  id: 'tokenService.form.readyOnly.help'
                })}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="public_access_only"
                label={intl.formatMessage({
                  id: 'tokenService.form.publicAccessOnly'
                })}
                extra={intl.formatMessage({
                  id: 'tokenService.form.publicAccessOnly.help'
                })}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </SettingsSection>
            <SettingsSection
              title={intl.formatMessage({
                id: 'tokenService.section.endpoint'
              })}
              description={intl.formatMessage({
                id: 'tokenService.section.endpoint.description'
              })}
            >
              <Form.Item
                name="api_endpoint"
                label={intl.formatMessage({
                  id: 'tokenService.form.apiEndpoint'
                })}
                extra={intl.formatMessage({
                  id: 'tokenService.form.apiEndpoint.help'
                })}
                rules={[urlRule]}
              >
                <Input allowClear placeholder="https://api.example.com/v1" />
              </Form.Item>
              <Form.Item
                name="api_docs_url"
                label={intl.formatMessage({
                  id: 'tokenService.form.apiDocsUrl'
                })}
                rules={[urlRule]}
              >
                <Input allowClear placeholder="https://docs.example.com" />
              </Form.Item>
            </SettingsSection>
            <SettingsSection
              title={intl.formatMessage({
                id: 'tokenService.section.examples'
              })}
              description={intl.formatMessage({
                id: 'tokenService.section.examples.description'
              })}
            >
              <p className={styles.exampleHint}>
                {intl.formatMessage(
                  { id: 'tokenService.examples.base' },
                  { origin: apiOrigin }
                )}
              </p>
              <Tabs
                size="small"
                activeKey={activeExample}
                onChange={(key) => setExampleKind(key as ExampleKind)}
                items={exampleItems}
              />
              <div className={styles.codeBlock}>
                <pre>{examples[activeExample]}</pre>
                <span className="copy">
                  <CopyButton
                    text={examples[activeExample]}
                    type="text"
                    size="small"
                  />
                </span>
              </div>
            </SettingsSection>
            <div className={styles.actions}>
              <Button type="primary" loading={saving} onClick={handleSave}>
                {intl.formatMessage({ id: 'common.button.save' })}
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
    </PageBox>
  );
};

TokenServiceSettings.displayName = 'TokenServiceSettings';

export default TokenServiceSettings;
