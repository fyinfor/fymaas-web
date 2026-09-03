import { request, useIntl } from '@umijs/max';
import {
  Button,
  Checkbox,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  message
} from 'antd';
import React from 'react';
import PageBox from '../_components/page-box';

const Roles: React.FC = () => {
  const intl = useIntl();
  const [roles, setRoles] = React.useState<any[]>([]);
  const [catalog, setCatalog] = React.useState<any[]>([]);
  const [bindings, setBindings] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [bindOpen, setBindOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [bindForm] = Form.useForm();

  const load = async () => {
    const [r, p, b] = await Promise.all([
      request('/roles', { params: { page: 1, perPage: 100 } }),
      request('/roles/permissions'),
      request('/roles/bindings', { params: { page: 1, perPage: 100 } })
    ]);
    setRoles(r.items || []);
    setCatalog(p || []);
    setBindings(b.items || []);
  };

  React.useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const save = async () => {
    const values = await form.validateFields();
    await request('/roles', { method: 'POST', data: values });
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    setOpen(false);
    form.resetFields();
    load();
  };

  const remove = async (id: number) => {
    await request(`/roles/${id}`, { method: 'DELETE' });
    load();
  };

  const saveBinding = async () => {
    const values = await bindForm.validateFields();
    await request('/roles/bindings', {
      method: 'POST',
      data: {
        ...values,
        scope_type: values.scope_type || 'org',
        scope_id: values.scope_id || 0
      }
    });
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    setBindOpen(false);
    bindForm.resetFields();
    load();
  };

  const removeBinding = async (id: number) => {
    await request(`/roles/bindings/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <PageBox>
      <Tabs
        items={[
          {
            key: 'roles',
            label: intl.formatMessage({ id: 'roles.tab.roles' }),
            children: (
              <>
                <Space style={{ margin: '8px 0 16px' }}>
                  <Button type="primary" onClick={() => setOpen(true)}>
                    {intl.formatMessage({ id: 'roles.add' })}
                  </Button>
                </Space>
                <Table
                  rowKey="id"
                  dataSource={roles}
                  columns={[
                    {
                      title: intl.formatMessage({ id: 'common.table.name' }),
                      dataIndex: 'name'
                    },
                    {
                      title: intl.formatMessage({ id: 'roles.scope' }),
                      dataIndex: 'scope'
                    },
                    {
                      title: intl.formatMessage({ id: 'roles.permissions' }),
                      dataIndex: 'permissions',
                      render: (v: string[]) => (v || []).join(', ')
                    },
                    {
                      title: intl.formatMessage({
                        id: 'common.table.operation'
                      }),
                      render: (_: any, row: any) =>
                        row.builtin ? null : (
                          <a onClick={() => remove(row.id)}>
                            {intl.formatMessage({ id: 'common.button.delete' })}
                          </a>
                        )
                    }
                  ]}
                />
              </>
            )
          },
          {
            key: 'bindings',
            label: intl.formatMessage({ id: 'roles.tab.bindings' }),
            children: (
              <>
                <Space style={{ margin: '8px 0 16px' }}>
                  <Button type="primary" onClick={() => setBindOpen(true)}>
                    {intl.formatMessage({ id: 'roles.binding.add' })}
                  </Button>
                </Space>
                <Table
                  rowKey="id"
                  dataSource={bindings}
                  columns={[
                    {
                      title: intl.formatMessage({
                        id: 'roles.binding.principal'
                      }),
                      dataIndex: 'principal_name'
                    },
                    {
                      title: intl.formatMessage({ id: 'roles.binding.role' }),
                      dataIndex: 'role_name'
                    },
                    {
                      title: intl.formatMessage({ id: 'roles.scope' }),
                      dataIndex: 'scope_type'
                    },
                    {
                      title: intl.formatMessage({
                        id: 'common.table.operation'
                      }),
                      render: (_: any, row: any) => (
                        <a onClick={() => removeBinding(row.id)}>
                          {intl.formatMessage({ id: 'common.button.delete' })}
                        </a>
                      )
                    }
                  ]}
                />
              </>
            )
          }
        ]}
      />
      <Drawer
        open={open}
        width={520}
        onClose={() => setOpen(false)}
        title={intl.formatMessage({ id: 'roles.add' })}
        extra={
          <Button type="primary" onClick={save}>
            {intl.formatMessage({ id: 'common.button.save' })}
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ scope: 'org', permissions: [] }}
        >
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'common.table.name' })}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={intl.formatMessage({ id: 'common.table.description' })}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="permissions"
            label={intl.formatMessage({ id: 'roles.permissions' })}
          >
            <Checkbox.Group
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              options={catalog.map((p) => ({
                label: `${p.key} — ${p.description}`,
                value: p.key
              }))}
            />
          </Form.Item>
        </Form>
      </Drawer>
      <Drawer
        open={bindOpen}
        width={480}
        onClose={() => setBindOpen(false)}
        title={intl.formatMessage({ id: 'roles.binding.add' })}
        extra={
          <Button type="primary" onClick={saveBinding}>
            {intl.formatMessage({ id: 'common.button.save' })}
          </Button>
        }
      >
        <Form
          form={bindForm}
          layout="vertical"
          initialValues={{ scope_type: 'org' }}
        >
          <Form.Item
            name="role_id"
            label={intl.formatMessage({ id: 'roles.binding.role' })}
            rules={[{ required: true }]}
          >
            <Select
              options={roles.map((r) => ({ label: r.name, value: r.id }))}
            />
          </Form.Item>
          <Form.Item
            name="principal_id"
            label={intl.formatMessage({ id: 'roles.binding.principalId' })}
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="scope_type"
            label={intl.formatMessage({ id: 'roles.scope' })}
          >
            <Select
              options={[
                { label: 'org', value: 'org' },
                { label: 'platform', value: 'platform' },
                { label: 'cluster', value: 'cluster' }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="scope_id"
            label={intl.formatMessage({ id: 'roles.binding.scopeId' })}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Drawer>
    </PageBox>
  );
};

export default Roles;
