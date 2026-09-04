import { ScrollerModal } from '@gpustack/core-ui';
import { request, useIntl } from '@umijs/max';
import { Input, Typography, message } from 'antd';
import React from 'react';
import { notifyWorkspaceListChanged } from './workspace-events';

export type DeletableWorkspace = {
  id: number;
  name: string;
  display_name?: string;
};

type Props = {
  workspace: DeletableWorkspace | null;
  open: boolean;
  onCancel: () => void;
  onDeleted?: () => void;
};

const DeleteWorkspaceModal: React.FC<Props> = ({
  workspace,
  open,
  onCancel,
  onDeleted
}) => {
  const intl = useIntl();
  const [typed, setTyped] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const expected = workspace?.name || '';
  const matched = !!expected && typed.trim() === expected;

  React.useEffect(() => {
    if (open) setTyped('');
  }, [open, workspace?.id]);

  const handleOk = async () => {
    if (!workspace || !matched) return;
    setSubmitting(true);
    try {
      await request(`/workspaces/${workspace.id}`, { method: 'DELETE' });
      message.success(intl.formatMessage({ id: 'common.message.success' }));
      notifyWorkspaceListChanged();
      onDeleted?.();
      onCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollerModal
      title={intl.formatMessage({
        id: 'workspaces.delete.title',
        defaultMessage: 'Delete workspace'
      })}
      open={open}
      centered
      onCancel={onCancel}
      onOk={handleOk}
      okText={intl.formatMessage({ id: 'common.button.delete' })}
      okButtonProps={{ danger: true, disabled: !matched }}
      confirmLoading={submitting}
      destroyOnHidden
      closeIcon
      width={480}
      getContainer={() => document.body}
    >
      <Typography.Paragraph style={{ marginTop: 8, marginBottom: 8 }}>
        {intl.formatMessage({
          id: 'workspaces.delete.confirmHint',
          defaultMessage:
            'This cannot be undone. Type the workspace name below to confirm.'
        })}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text code>{expected}</Typography.Text>
      </Typography.Paragraph>
      <Input
        autoFocus
        value={typed}
        placeholder={intl.formatMessage({
          id: 'workspaces.delete.namePlaceholder',
          defaultMessage: 'Workspace name'
        })}
        onChange={(event) => setTyped(event.target.value)}
        onPressEnter={handleOk}
      />
    </ScrollerModal>
  );
};

export default DeleteWorkspaceModal;
