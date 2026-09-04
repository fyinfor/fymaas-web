import { StatusBadge } from '@/components/console';
import {
  queryLdapSettings,
  testLdapSettings,
  updateLdapSettings
} from '@/enterprise/ldap/apis';
import PageBox from '@/pages/_components/page-box';
import SettingsSection from '@/pages/profile/components/settings-section';
import { useIntl } from '@umijs/max';
import { Button, Form, Input, Space, Spin, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';

const FIELDS = [
  'server_uri',
  'bind_dn',
  'search_base',
  'user_filter',
  'username_attribute',
  'display_name_attribute',
  'email_attribute',
  'group_attribute'
] as const;

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

const LdapSettings: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await queryLdapSettings();
        setConfigured(!!data.configured);
        form.setFieldsValue(data);
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
    const payload: Record<string, unknown> = {};
    for (const field of FIELDS) {
      const value = values[field];
      payload[field] = value === undefined || value === '' ? null : value;
    }
    if (values.bind_password) {
      payload.bind_password = values.bind_password;
    }
    setSaving(true);
    try {
      const data = await updateLdapSettings(payload);
      setConfigured(!!data.configured);
      form.setFieldValue('bind_password', undefined);
      message.success(intl.formatMessage({ id: 'ldap.message.saved' }));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await testLdapSettings();
      message.success(intl.formatMessage({ id: 'ldap.test.ok' }));
    } catch {
      // Global handler.
    } finally {
      setTesting(false);
    }
  };

  return (
    <PageBox>
      <Spin spinning={loading}>
        <div className={styles.wrapper}>
          <p className={styles.description}>
            {intl.formatMessage({ id: 'ldap.page.description' })}
          </p>
          <StatusBadge tone={configured ? 'success' : 'neutral'} plain>
            {intl.formatMessage({
              id: configured ? 'ldap.status.enabled' : 'ldap.status.disabled'
            })}
          </StatusBadge>
          <Form form={form} layout="vertical" requiredMark={false}>
            <SettingsSection
              title={intl.formatMessage({ id: 'ldap.section.server' })}
              description={intl.formatMessage({
                id: 'ldap.section.server.description'
              })}
            >
              <Form.Item
                name="server_uri"
                label={intl.formatMessage({ id: 'ldap.form.serverUri' })}
              >
                <Input allowClear placeholder="ldaps://directory.example.com" />
              </Form.Item>
              <Form.Item
                name="search_base"
                label={intl.formatMessage({ id: 'ldap.form.searchBase' })}
              >
                <Input allowClear placeholder="ou=people,dc=example,dc=com" />
              </Form.Item>
              <Form.Item
                name="bind_dn"
                label={intl.formatMessage({ id: 'ldap.form.bindDn' })}
              >
                <Input allowClear placeholder="cn=readonly,dc=example,dc=com" />
              </Form.Item>
              <Form.Item
                name="bind_password"
                label={intl.formatMessage({ id: 'ldap.form.bindPassword' })}
              >
                <Input.Password
                  allowClear
                  placeholder={intl.formatMessage({
                    id: 'ldap.form.bindPassword.holder'
                  })}
                />
              </Form.Item>
            </SettingsSection>
            <SettingsSection
              title={intl.formatMessage({ id: 'ldap.section.mapping' })}
              description={intl.formatMessage({
                id: 'ldap.section.mapping.description'
              })}
            >
              <Form.Item
                name="user_filter"
                label={intl.formatMessage({ id: 'ldap.form.userFilter' })}
              >
                <Input allowClear placeholder="(uid={username})" />
              </Form.Item>
              <Form.Item
                name="username_attribute"
                label={intl.formatMessage({ id: 'ldap.form.usernameAttr' })}
              >
                <Input allowClear placeholder="uid" />
              </Form.Item>
              <Form.Item
                name="display_name_attribute"
                label={intl.formatMessage({ id: 'ldap.form.displayNameAttr' })}
              >
                <Input allowClear placeholder="cn" />
              </Form.Item>
              <Form.Item
                name="email_attribute"
                label={intl.formatMessage({ id: 'ldap.form.emailAttr' })}
              >
                <Input allowClear placeholder="mail" />
              </Form.Item>
              <Form.Item
                name="group_attribute"
                label={intl.formatMessage({ id: 'ldap.form.groupAttr' })}
              >
                <Input allowClear placeholder="memberOf" />
              </Form.Item>
            </SettingsSection>
            <div className={styles.actions}>
              <Space>
                <Button type="primary" loading={saving} onClick={handleSave}>
                  {intl.formatMessage({ id: 'common.button.save' })}
                </Button>
                <Button loading={testing} onClick={handleTest}>
                  {intl.formatMessage({ id: 'ldap.test' })}
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      </Spin>
    </PageBox>
  );
};

LdapSettings.displayName = 'LdapSettings';

export default LdapSettings;
