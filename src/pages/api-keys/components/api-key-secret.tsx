import {
  CopyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, message } from 'antd';
import { useState, type SyntheticEvent } from 'react';

const maskApiKey = (value: string): string => {
  const secret = value.trim();
  if (!secret) return '••••';
  const head = secret.length > 16 ? 8 : 4;
  const tail = 4;
  if (secret.length <= head + tail) {
    const keep = Math.max(1, Math.floor(secret.length / 3));
    return `${secret.slice(0, keep)}••••${secret.slice(-keep)}`;
  }
  return `${secret.slice(0, head)}••••••••${secret.slice(-tail)}`;
};

const stopRow = (event: SyntheticEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const ApiKeySecret: React.FC<{
  value?: string;
  maskedValue?: string;
  block?: boolean;
}> = ({ value, maskedValue, block }) => {
  const intl = useIntl();
  const [hidden, setHidden] = useState(true);
  const secret = (value || '').trim();
  const display = secret
    ? hidden
      ? maskApiKey(secret)
      : secret
    : maskedValue || '-';

  const copy = async () => {
    if (!secret) {
      message.warning(
        intl.formatMessage({ id: 'apikeys.table.copyUnavailable' })
      );
      return;
    }
    await navigator.clipboard.writeText(secret);
    message.success(intl.formatMessage({ id: 'common.copy.success' }));
  };

  return (
    <span
      className="flex items-center gap-4"
      style={{ minWidth: 0, maxWidth: '100%' }}
      onClick={stopRow}
      onMouseDown={stopRow}
    >
      <button
        type="button"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: block ? 13 : 12,
          cursor: secret ? 'pointer' : 'default',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: block ? 'pre-wrap' : 'nowrap',
          wordBreak: block ? 'break-all' : undefined,
          flex: 1,
          minWidth: 0,
          textAlign: 'left',
          padding: block ? 0 : '2px 4px',
          border: 0,
          borderRadius: 4,
          background: 'transparent',
          color: 'inherit'
        }}
        title={
          secret
            ? intl.formatMessage({ id: 'apikeys.table.copyHint' })
            : undefined
        }
        onClick={() => {
          void copy();
        }}
      >
        {display}
      </button>
      <Button
        type="text"
        size="small"
        disabled={!secret}
        aria-label={intl.formatMessage({
          id: hidden ? 'apikeys.table.showKey' : 'apikeys.table.hideKey'
        })}
        title={intl.formatMessage({
          id: hidden ? 'apikeys.table.showKey' : 'apikeys.table.hideKey'
        })}
        icon={hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        onClick={() => setHidden((current) => !current)}
      />
      <Button
        type="text"
        size="small"
        disabled={!secret}
        aria-label={intl.formatMessage({ id: 'apikeys.button.copySecret' })}
        title={intl.formatMessage({ id: 'apikeys.button.copySecret' })}
        icon={<CopyOutlined />}
        onClick={() => {
          void copy();
        }}
      />
    </span>
  );
};

export default ApiKeySecret;
