import { ScrollerModal } from '@gpustack/core-ui';
import { request, useIntl } from '@umijs/max';
import { Form, Input, Select, message } from 'antd';
import React from 'react';
import { notifyWorkspaceListChanged } from './workspace-events';

type OrgOption = { id: number; name: string };

export type CreatedWorkspace = {
  id: number;
  name?: string;
  display_name?: string;
};

type Props = {
  open: boolean;
  onCancel: () => void;
  onCreated?: (workspace: CreatedWorkspace) => void;
};

const CreateWorkspaceModal: React.FC<Props> = ({
  open,
  onCancel,
  onCreated
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [orgs, setOrgs] = React.useState<OrgOption[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    form.resetFields();
    request('/organization-directory', { params: { page: 1, perPage: 100 } })
      .then((page) => {
        const rows = (page.items || []).map((item: any) => ({
          id: item.id,
          name: item.display_name || item.name
        }));
        setOrgs(rows);
        if (rows.length === 1) {
          form.setFieldsValue({ organization_id: rows[0].id });
        }
      })
      .catch(() => undefined);
  }, [form, open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const created = await request('/workspaces', {
        method: 'POST',
        data: values
      });
      message.success(intl.formatMessage({ id: 'common.message.success' }));
      notifyWorkspaceListChanged();
      onCreated?.(created);
      onCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollerModal
      title={intl.formatMessage({ id: 'workspaces.add' })}
      open={open}
      centered
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={submitting}
      destroyOnHidden
      closeIcon
      width={480}
      getContainer={() => document.body}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item
          name="organization_id"
          label={intl.formatMessage({ id: 'workspaces.org' })}
          rules={[{ required: true }]}
        >
          <Select
            options={orgs.map((item) => ({
              label: item.name,
              value: item.id
            }))}
          />
        </Form.Item>
        <Form.Item
          name="name"
          label={intl.formatMessage({ id: 'workspaces.form.name' })}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="display_name"
          label={intl.formatMessage({ id: 'common.table.displayName' })}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label={intl.formatMessage({ id: 'common.table.description' })}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </ScrollerModal>
  );
};

export default CreateWorkspaceModal;
