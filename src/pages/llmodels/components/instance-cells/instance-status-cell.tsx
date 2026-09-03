import { StatusBadge, statusTone } from '@/components/console';
import { useIntl } from '@umijs/max';
import { Button, Tooltip } from 'antd';
import React from 'react';
import {
  InstanceStatusMap,
  InstanceStatusMapValue,
  status
} from '../../config';
import { ModelInstanceListItem } from '../../config/types';

interface InstanceStatusProps {
  record: ModelInstanceListItem;
  onSelect: (val: string, record: ModelInstanceListItem) => void;
}

const InstanceStatusTag: React.FC<InstanceStatusProps> = ({
  record,
  onSelect
}) => {
  const intl = useIntl();
  if (!record.state) {
    return null;
  }
  const downloading = record.state === InstanceStatusMap.Downloading;
  const downloadDone = downloading && record.download_progress === 100;
  const tone = statusTone(
    downloadDone ? status[InstanceStatusMap.Running] : status[record.state]
  );
  const label = InstanceStatusMapValue[record.state];
  const message = downloadDone ? '' : record.state_message;
  const badge = (
    <StatusBadge tone={tone} plain>
      {label}
      {downloading && !downloadDone
        ? ` ${Math.round(record.download_progress || 0)}%`
        : ''}
    </StatusBadge>
  );
  return (
    <span className="flex-center" style={{ gap: 8 }}>
      {message ? <Tooltip title={message}>{badge}</Tooltip> : badge}
      {record.state === InstanceStatusMap.Error && record.worker_id ? (
        <Button
          type="link"
          size="small"
          style={{ paddingLeft: 0 }}
          onClick={() => onSelect('viewlog', record)}
        >
          {intl.formatMessage({ id: 'models.list.more.logs' })}
        </Button>
      ) : null}
    </span>
  );
};

export default InstanceStatusTag;
