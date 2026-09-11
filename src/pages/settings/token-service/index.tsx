import {
  queryModelsCatalogSettings,
  updateModelsCatalogSettings,
  type ModelsCatalogSettings
} from '@/enterprise/models-catalog/apis';
import PageBox from '@/pages/_components/page-box';
import SettingsSection from '@/pages/profile/components/settings-section';
import { useIntl } from '@umijs/max';
import { Button, Form, Input, Spin, Switch, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';

const URL_PATTERN = /^https?:\/\/.+/i;

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
  actions: css`
    margin-top: 40px;
  `
}));

const TokenServiceSettings: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paths, setPaths] = useState({
    public_models_path: '/api/models',
    compat_models_path: '/v1/models'
  });

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
