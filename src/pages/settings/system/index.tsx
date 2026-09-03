import {
  querySystemSettings,
  updateSystemSettings
} from '@/enterprise/system-settings/apis';
import PageBox from '@/pages/_components/page-box';
import SettingsSection from '@/pages/profile/components/settings-section';
import { useIntl } from '@umijs/max';
import { Button, Form, Select, Spin, message } from 'antd';
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
  `
}));

const SystemSettings: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await querySystemSettings();
        form.setFieldsValue({
          base_currency: data.base_currency || 'CNY'
        });
      } catch {
        form.setFieldsValue({ base_currency: 'CNY' });
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
      const data = await updateSystemSettings({
        base_currency: values.base_currency
      });
      form.setFieldsValue(data);
      message.success(
        intl.formatMessage({ id: 'systemSettings.message.saved' })
      );
    } finally {
      setSaving(false);
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
            initialValues={{ base_currency: 'CNY' }}
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

SystemSettings.displayName = 'SystemSettings';

export default SystemSettings;
