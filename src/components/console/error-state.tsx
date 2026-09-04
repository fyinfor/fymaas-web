import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';
import EmptyState from './empty-state';

const ErrorState: React.FC<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  lastSuccess?: React.ReactNode;
  onRetry?: () => void;
  style?: React.CSSProperties;
}> = ({ title, description, lastSuccess, onRetry, style }) => {
  const intl = useIntl();
  return (
    <EmptyState
      icon={<WarningOutlined />}
      title={title || intl.formatMessage({ id: 'common.error.load' })}
      description={
        description ||
        (lastSuccess
          ? intl.formatMessage(
              { id: 'common.error.lastSuccess' },
              { time: lastSuccess }
            )
          : intl.formatMessage({ id: 'common.error.load.hint' }))
      }
      action={
        onRetry ? (
          <Button icon={<ReloadOutlined />} onClick={onRetry}>
            {intl.formatMessage({ id: 'common.button.retry' })}
          </Button>
        ) : undefined
      }
      style={style}
    />
  );
};

export default ErrorState;
