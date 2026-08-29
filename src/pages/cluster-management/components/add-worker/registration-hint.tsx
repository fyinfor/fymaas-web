import { workerAddedCountAtom } from '@/atoms/clusters';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { AlertBlockInfo } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';

const WAIT_MS = 20000;

const RegistrationHint: React.FC<{
  serverUrl: string;
}> = ({ serverUrl }) => {
  const intl = useIntl();
  const addedCount = useAtomValue(workerAddedCountAtom);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setWaiting(false);
    if (!serverUrl || addedCount > 0) {
      return;
    }
    const timer = window.setTimeout(() => setWaiting(true), WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [serverUrl, addedCount]);

  if (addedCount > 0 || !waiting) {
    return null;
  }

  return (
    <AlertBlockInfo
      style={{ marginTop: 12 }}
      type="warning"
      icon={<ExclamationCircleFilled />}
      title={intl.formatMessage({
        id: 'clusters.addworker.register.waiting'
      })}
      message={
        <div
          dangerouslySetInnerHTML={{
            __html: intl.formatMessage({
              id: 'clusters.addworker.register.waiting.tips'
            })
          }}
        />
      }
    />
  );
};

export default RegistrationHint;
