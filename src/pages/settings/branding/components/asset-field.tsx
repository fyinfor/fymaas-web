import {
  deleteBrandingAsset,
  uploadBrandingAsset
} from '@/enterprise/branding/apis';
import type {
  BrandingAssetKind,
  BrandingPublic
} from '@/enterprise/branding/types';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Space, Typography, Upload, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';

// Mirrors the server's own limit and allow-list; duplicated here only so
// an oversized file is rejected before it goes over the wire.
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_LABEL = '2MB';
const ACCEPTED = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon'
];

const useStyles = createStyles(({ token, css }) => ({
  row: css`
    display: flex;
    align-items: flex-start;
    gap: 16px;
  `,
  preview: css`
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 56px;
    padding: 6px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    background:
      linear-gradient(45deg, ${token.colorFillQuaternary} 25%, transparent 25%),
      linear-gradient(
        -45deg,
        ${token.colorFillQuaternary} 25%,
        transparent 25%
      ),
      linear-gradient(45deg, transparent 75%, ${token.colorFillQuaternary} 75%),
      linear-gradient(-45deg, transparent 75%, ${token.colorFillQuaternary} 75%);
    background-size: 12px 12px;
    background-position:
      0 0,
      0 6px,
      6px -6px,
      -6px 0;
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  `,
  placeholder: css`
    font-size: 12px;
    color: ${token.colorTextQuaternary};
  `,
  hint: css`
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `
}));

interface AssetFieldProps {
  kind: BrandingAssetKind;
  url?: string | null;
  tips?: string;
  /** Every mutation returns the whole branding payload, so the page can
   * refresh all asset URLs from one response. */
  onChanged: (branding: BrandingPublic) => void;
}

const AssetField: React.FC<AssetFieldProps> = ({
  kind,
  url,
  tips,
  onChanged
}) => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [busy, setBusy] = useState(false);

  const handleBeforeUpload = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      message.error(intl.formatMessage({ id: 'branding.asset.error.type' }));
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_BYTES) {
      message.error(
        intl.formatMessage(
          { id: 'branding.asset.error.size' },
          { size: MAX_LABEL }
        )
      );
      return Upload.LIST_IGNORE;
    }

    setBusy(true);
    try {
      onChanged(await uploadBrandingAsset(kind, file));
      message.success(
        intl.formatMessage({ id: 'branding.message.assetUpdated' })
      );
    } catch {
      // The global error handler already surfaced it.
    } finally {
      setBusy(false);
    }
    // Returning false keeps antd from doing its own request; the upload
    // above is the real one.
    return false;
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      onChanged(await deleteBrandingAsset(kind));
      message.success(
        intl.formatMessage({ id: 'branding.message.assetRemoved' })
      );
    } catch {
      // Already surfaced.
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.row}>
      <div className={styles.preview}>
        {url ? (
          <img src={url} alt="" />
        ) : (
          <span className={styles.placeholder}>
            {intl.formatMessage({ id: 'branding.asset.empty' })}
          </span>
        )}
      </div>
      <div>
        <Space>
          <Upload
            accept={ACCEPTED.join(',')}
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
          >
            <Button icon={<UploadOutlined />} loading={busy}>
              {intl.formatMessage({
                id: url ? 'branding.asset.replace' : 'branding.asset.upload'
              })}
            </Button>
          </Upload>
          {url && (
            <Button
              icon={<DeleteOutlined />}
              danger
              type="text"
              disabled={busy}
              onClick={handleRemove}
            />
          )}
        </Space>
        <Typography.Text className={styles.hint}>
          {tips ||
            intl.formatMessage(
              { id: 'branding.asset.hint' },
              { size: MAX_LABEL }
            )}
        </Typography.Text>
      </div>
    </div>
  );
};

AssetField.displayName = 'AssetField';

export default AssetField;
