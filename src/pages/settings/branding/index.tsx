import { queryBranding, updateBranding } from '@/enterprise/branding/apis';
import { DEFAULT_PRODUCT_NAME } from '@/enterprise/branding/runtime';
import type {
  BrandingConfig,
  BrandingPublic
} from '@/enterprise/branding/types';
import PageBox from '@/pages/_components/page-box';
import SettingsSection from '@/pages/profile/components/settings-section';
import { useIntl } from '@umijs/max';
import { Button, ColorPicker, Form, Input, Spin, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import AssetField from './components/asset-field';

// Every writable field, listed so that save can send an explicit null for
// the ones left blank. Omitting a key means "leave it alone" server-side,
// which would make clearing a field impossible.
const CONFIG_FIELDS: (keyof BrandingConfig)[] = [
  'product_name',
  'color_primary',
  'login_title',
  'login_subtitle',
  'doc_url',
  'support_url',
  'contact_url',
  'custom_domain'
];

// Same shapes the server accepts, checked here for immediate feedback.
const URL_PATTERN = /^(https?:\/\/.+|\/(?!\/).*)$/;
const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(?:\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;

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
  preview: css`
    margin: 0 0 32px;
    padding: 16px 20px;
    border: 1px solid var(--ant-color-border-secondary);
    border-radius: 8px;
    background: #f8fafa;
  `,
  previewBar: css`
    height: 8px;
    border-radius: 4px;
    margin-bottom: 12px;
  `,
  previewName: css`
    font-size: 18px;
    font-weight: 600;
    color: #182022;
  `,
  previewTitle: css`
    margin-top: 8px;
    font-size: 14px;
    color: #182022;
  `,
  previewSubtitle: css`
    margin-top: 4px;
    font-size: 13px;
    color: #5b6b6d;
  `
}));

const Branding: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [branding, setBranding] = useState<BrandingPublic>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await queryBranding();
        setBranding(data);
        form.setFieldsValue(data);
      } catch {
        // Already surfaced by the global handler; the form stays empty,
        // which is also what an unconfigured deployment looks like.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    const payload = CONFIG_FIELDS.reduce(
      (acc, field) => {
        const value = values[field];
        acc[field] = value === undefined || value === '' ? null : value;
        return acc;
      },
      {} as Record<string, unknown>
    );

    setSaving(true);
    try {
      await updateBranding(payload as BrandingConfig);
      message.success(intl.formatMessage({ id: 'branding.message.saved' }));
      // The product name, favicon, logos and theme colour are all applied
      // once at boot (see src/enterprise). Reloading is what makes them
      // take effect together rather than leaving the page half-rebranded.
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setSaving(false);
    }
  };

  const previewName = Form.useWatch('product_name', form);
  const previewColor = Form.useWatch('color_primary', form);
  const previewTitle = Form.useWatch('login_title', form);
  const previewSubtitle = Form.useWatch('login_subtitle', form);

  const resolvedColor = React.useMemo(() => {
    if (typeof previewColor === 'string' && previewColor) {
      return previewColor;
    }
    if (previewColor && typeof previewColor.toHexString === 'function') {
      return previewColor.toHexString();
    }
    return branding.color_primary || '#0F8F8A';
  }, [previewColor, branding.color_primary]);

  const urlRules = [
    {
      pattern: URL_PATTERN,
      message: intl.formatMessage({ id: 'branding.form.rule.url' })
    }
  ];

  return (
    <PageBox>
      <Spin spinning={loading}>
        <div className={styles.wrapper}>
          <p className={styles.description}>
            {intl.formatMessage({ id: 'branding.page.description' })}
          </p>
          <div className={styles.preview}>
            <div
              className={styles.previewBar}
              style={{ background: resolvedColor }}
            />
            <div className={styles.previewName}>
              {previewName || branding.product_name || DEFAULT_PRODUCT_NAME}
            </div>
            {previewTitle || branding.login_title ? (
              <div className={styles.previewTitle}>
                {previewTitle || branding.login_title}
              </div>
            ) : null}
            {previewSubtitle || branding.login_subtitle ? (
              <div className={styles.previewSubtitle}>
                {previewSubtitle || branding.login_subtitle}
              </div>
            ) : null}
          </div>

          <Form form={form} layout="vertical" requiredMark={false}>
            <SettingsSection
              title={intl.formatMessage({ id: 'branding.section.identity' })}
              description={intl.formatMessage({
                id: 'branding.section.identity.description'
              })}
            >
              <Form.Item
                name="product_name"
                label={intl.formatMessage({ id: 'branding.form.productName' })}
              >
                <Input
                  maxLength={128}
                  allowClear
                  placeholder={intl.formatMessage({
                    id: 'branding.form.productName.holder'
                  })}
                />
              </Form.Item>
            </SettingsSection>

            <SettingsSection
              title={intl.formatMessage({ id: 'branding.section.appearance' })}
              description={intl.formatMessage({
                id: 'branding.section.appearance.description'
              })}
            >
              <Form.Item
                name="color_primary"
                label={intl.formatMessage({ id: 'branding.form.colorPrimary' })}
                getValueFromEvent={(color: any, css?: string) =>
                  css ?? color?.toHexString?.() ?? color
                }
              >
                <ColorPicker showText format="hex" disabledAlpha />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({ id: 'branding.form.logoLight' })}
              >
                <AssetField
                  kind="logo_light"
                  url={branding.logo_light_url}
                  tips={intl.formatMessage({
                    id: 'branding.form.logoLight.tips'
                  })}
                  onChanged={setBranding}
                />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({ id: 'branding.form.logoDark' })}
              >
                <AssetField
                  kind="logo_dark"
                  url={branding.logo_dark_url}
                  tips={intl.formatMessage({
                    id: 'branding.form.logoDark.tips'
                  })}
                  onChanged={setBranding}
                />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({ id: 'branding.form.miniLogo' })}
              >
                <AssetField
                  kind="mini_logo"
                  url={branding.mini_logo_url}
                  tips={intl.formatMessage({
                    id: 'branding.form.miniLogo.tips'
                  })}
                  onChanged={setBranding}
                />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({ id: 'branding.form.favicon' })}
              >
                <AssetField
                  kind="favicon"
                  url={branding.favicon_url}
                  tips={intl.formatMessage({
                    id: 'branding.form.favicon.tips'
                  })}
                  onChanged={setBranding}
                />
              </Form.Item>
            </SettingsSection>

            <SettingsSection
              title={intl.formatMessage({ id: 'branding.section.login' })}
              description={intl.formatMessage({
                id: 'branding.section.login.description'
              })}
            >
              <Form.Item
                name="login_title"
                label={intl.formatMessage({ id: 'branding.form.loginTitle' })}
              >
                <Input maxLength={128} allowClear />
              </Form.Item>

              <Form.Item
                name="login_subtitle"
                label={intl.formatMessage({
                  id: 'branding.form.loginSubtitle'
                })}
              >
                <Input maxLength={128} allowClear />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({
                  id: 'branding.form.loginBackground'
                })}
              >
                <AssetField
                  kind="login_background"
                  url={branding.login_background_url}
                  tips={intl.formatMessage({
                    id: 'branding.form.loginBackground.tips'
                  })}
                  onChanged={setBranding}
                />
              </Form.Item>
            </SettingsSection>

            <SettingsSection
              title={intl.formatMessage({ id: 'branding.section.links' })}
              description={intl.formatMessage({
                id: 'branding.section.links.description'
              })}
            >
              <Form.Item
                name="doc_url"
                label={intl.formatMessage({ id: 'branding.form.docUrl' })}
                rules={urlRules}
              >
                <Input allowClear placeholder="https://docs.example.com" />
              </Form.Item>

              <Form.Item
                name="support_url"
                label={intl.formatMessage({ id: 'branding.form.supportUrl' })}
                rules={urlRules}
              >
                <Input allowClear placeholder="https://support.example.com" />
              </Form.Item>

              <Form.Item
                name="contact_url"
                label={intl.formatMessage({ id: 'branding.form.contactUrl' })}
                rules={urlRules}
              >
                <Input allowClear placeholder="https://example.com/contact" />
              </Form.Item>

              <Form.Item
                name="custom_domain"
                label={intl.formatMessage({ id: 'branding.form.customDomain' })}
                extra={intl.formatMessage({
                  id: 'branding.form.customDomain.tips'
                })}
                rules={[
                  {
                    pattern: HOSTNAME_PATTERN,
                    message: intl.formatMessage({
                      id: 'branding.form.rule.domain'
                    })
                  }
                ]}
              >
                <Input allowClear placeholder="ai.example.com" />
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

Branding.displayName = 'Branding';

export default Branding;
