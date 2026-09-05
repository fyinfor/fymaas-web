import {
  querySystemSettings,
  syncOfficialCatalog,
  updateSystemSettings,
  type CatalogLastSync,
  type SystemSettings
} from '@/enterprise/system-settings/apis';
import PageBox from '@/pages/_components/page-box';
import SettingsSection from '@/pages/profile/components/settings-section';
import { useIntl } from '@umijs/max';
import {
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Switch,
  message
} from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';

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
  actions: css`
    margin-top: 40px;
  `,
  lastSync: css`
    margin-top: 16px;
  `
}));

const SystemSettingsPage: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<CatalogLastSync | null>(null);

  const applyValues = (data: SystemSettings) => {
    form.setFieldsValue({
      base_currency: data.base_currency || 'CNY',
      fx_cny_per_usd: Number(data.fx_cny_per_usd || 7.25),
      catalog_source: data.catalog_source || 'models-dev',
      catalog_provider_slugs: data.catalog_provider_slugs || '',
      catalog_priced_only: data.catalog_priced_only !== false,
      catalog_import_new: !!data.catalog_import_new,
      catalog_apply_default_plan: !!data.catalog_apply_default_plan
    });
    setLastSync(data.catalog_last_sync || null);
  };

  useEffect(() => {
    const load = async () => {
      try {
        applyValues(await querySystemSettings());
      } catch {
        form.setFieldsValue({
          base_currency: 'CNY',
          fx_cny_per_usd: 7.25,
          catalog_source: 'models-dev',
          catalog_priced_only: true,
          catalog_import_new: false,
          catalog_apply_default_plan: false
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const catalogPayload = (values: any) => ({
    catalog_source: values.catalog_source,
    catalog_provider_slugs: values.catalog_provider_slugs || '',
    catalog_priced_only: !!values.catalog_priced_only,
    catalog_import_new: !!values.catalog_import_new,
    catalog_apply_default_plan: !!values.catalog_apply_default_plan
  });

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const data = await updateSystemSettings({
        base_currency: values.base_currency,
        fx_cny_per_usd: values.fx_cny_per_usd,
        ...catalogPayload(values)
      });
      applyValues(data);
      message.success(
        intl.formatMessage({ id: 'systemSettings.message.saved' })
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    const values = await form.validateFields();
    setSyncing(true);
    try {
      const saved = await updateSystemSettings({
        base_currency: values.base_currency,
        fx_cny_per_usd: values.fx_cny_per_usd,
        ...catalogPayload(values)
      });
      applyValues(saved);
      const result = await syncOfficialCatalog({
        source: values.catalog_source,
        provider_slugs: String(values.catalog_provider_slugs || '')
          .split(/[,\n]/)
          .map((item: string) => item.trim())
          .filter(Boolean),
        priced_only: !!values.catalog_priced_only,
        import_new: !!values.catalog_import_new,
        apply_default_plan: !!values.catalog_apply_default_plan
      });
      setLastSync(result);
      message.success(
        intl.formatMessage(
          { id: 'systemSettings.catalog.synced' },
          {
            created: result.created ?? 0,
            updated: result.updated ?? 0
          }
        )
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <PageBox>
      <Spin spinning={loading}>
        <div className={styles.wrapper}>
          <p className={styles.description}>
            {intl.formatMessage({ id: 'systemSettings.page.description' })}
          </p>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              base_currency: 'CNY',
              fx_cny_per_usd: 7.25,
              catalog_source: 'models-dev',
              catalog_priced_only: true,
              catalog_import_new: false,
              catalog_apply_default_plan: false
            }}
          >
            <SettingsSection
              title={intl.formatMessage({
                id: 'systemSettings.section.billing'
              })}
              description={intl.formatMessage({
                id: 'systemSettings.section.billing.description'
              })}
            >
              <Form.Item
                name="base_currency"
                label={intl.formatMessage({
                  id: 'systemSettings.form.baseCurrency'
                })}
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    {
                      value: 'CNY',
                      label: intl.formatMessage({
                        id: 'systemSettings.currency.CNY'
                      })
                    },
                    {
                      value: 'USD',
                      label: intl.formatMessage({
                        id: 'systemSettings.currency.USD'
                      })
                    }
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="fx_cny_per_usd"
                label={intl.formatMessage({
                  id: 'systemSettings.form.fxCnyPerUsd'
                })}
                extra={intl.formatMessage({
                  id: 'systemSettings.form.fxCnyPerUsd.help'
                })}
                rules={[{ required: true }]}
              >
                <InputNumber min={0.0001} step={0.01} style={{ width: 200 }} />
              </Form.Item>
            </SettingsSection>
            <SettingsSection
              title={intl.formatMessage({
                id: 'systemSettings.section.catalog'
              })}
              description={intl.formatMessage({
                id: 'systemSettings.section.catalog.description'
              })}
            >
              <Form.Item
                name="catalog_source"
                label={intl.formatMessage({
                  id: 'systemSettings.form.catalogSource'
                })}
              >
                <Select
                  options={[
                    {
                      value: 'models-dev',
                      label: intl.formatMessage({
                        id: 'systemSettings.form.catalogSource.modelsDev'
                      })
                    },
                    {
                      value: 'llm-metadata',
                      label: intl.formatMessage({
                        id: 'systemSettings.form.catalogSource.llmMetadata'
                      })
                    }
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="catalog_provider_slugs"
                label={intl.formatMessage({
                  id: 'systemSettings.form.catalogProviders'
                })}
                extra={intl.formatMessage({
                  id: 'systemSettings.form.catalogProviders.help'
                })}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="openai, anthropic, qwen"
                />
              </Form.Item>
              <Form.Item
                name="catalog_priced_only"
                valuePropName="checked"
                label={intl.formatMessage({
                  id: 'systemSettings.form.catalogPricedOnly'
                })}
                extra={intl.formatMessage({
                  id: 'systemSettings.form.catalogPricedOnly.help'
                })}
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="catalog_import_new"
                valuePropName="checked"
                label={intl.formatMessage({
                  id: 'systemSettings.form.catalogImportNew'
                })}
                extra={intl.formatMessage({
                  id: 'systemSettings.form.catalogImportNew.help'
                })}
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="catalog_apply_default_plan"
                valuePropName="checked"
                label={intl.formatMessage({
                  id: 'systemSettings.form.catalogApplyDefault'
                })}
                extra={intl.formatMessage({
                  id: 'systemSettings.form.catalogApplyDefault.help'
                })}
              >
                <Switch />
              </Form.Item>
              <Space>
                <Button loading={syncing} onClick={handleSync}>
                  {intl.formatMessage({
                    id: syncing
                      ? 'systemSettings.catalog.syncing'
                      : 'systemSettings.catalog.sync'
                  })}
                </Button>
              </Space>
              <div className={styles.lastSync}>
                {lastSync ? (
                  <Descriptions
                    size="small"
                    bordered
                    column={1}
                    title={intl.formatMessage({
                      id: 'systemSettings.catalog.lastSync'
                    })}
                  >
                    <Descriptions.Item
                      label={intl.formatMessage({
                        id: 'systemSettings.catalog.result.source'
                      })}
                    >
                      {lastSync.source || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={intl.formatMessage({
                        id: 'systemSettings.catalog.result.created'
                      })}
                    >
                      {lastSync.created ?? 0}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={intl.formatMessage({
                        id: 'systemSettings.catalog.result.updated'
                      })}
                    >
                      {lastSync.updated ?? 0}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={intl.formatMessage({
                        id: 'systemSettings.catalog.result.skipped'
                      })}
                    >
                      {lastSync.skipped ?? 0}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={intl.formatMessage({
                        id: 'systemSettings.catalog.result.skippedNotIn'
                      })}
                    >
                      {lastSync.skipped_not_in_catalog ?? 0}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={intl.formatMessage({
                        id: 'systemSettings.catalog.result.total'
                      })}
                    >
                      {lastSync.total_in_source ?? 0}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={intl.formatMessage({
                        id: 'systemSettings.catalog.result.providers'
                      })}
                    >
                      {lastSync.providers_touched ?? 0}
                    </Descriptions.Item>
                    {lastSync.errors?.length ? (
                      <Descriptions.Item
                        label={intl.formatMessage({
                          id: 'systemSettings.catalog.result.errors'
                        })}
                      >
                        {lastSync.errors.join('; ')}
                      </Descriptions.Item>
                    ) : null}
                    <Descriptions.Item
                      label={intl.formatMessage({
                        id: 'systemSettings.catalog.result.syncedAt'
                      })}
                    >
                      {lastSync.synced_at || '—'}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <p className={styles.description}>
                    {intl.formatMessage({
                      id: 'systemSettings.catalog.lastSync.empty'
                    })}
                  </p>
                )}
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

SystemSettingsPage.displayName = 'SystemSettings';

export default SystemSettingsPage;
