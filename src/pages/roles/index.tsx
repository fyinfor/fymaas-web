import {
  catalogRoleLabel,
  roleKey,
  sortCatalogRoles
} from '@/enterprise/role-labels';
import { request, useAccess, useIntl, useModel } from '@umijs/max';
import {
  Button,
  Checkbox,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import PageBox from '../_components/page-box';
import {
  patchRolePermission,
  queryPermissionCatalog,
  type PermissionItem
} from '../permissions/apis';

const Roles: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const { initialState } = useModel('@@initialState') || {};
  const isPlatformAdmin = !!initialState?.currentUser?.is_admin;
  const canWrite = !!(access.canSeeAdmin || access.canManageCurrentOrg);
  const [roles, setRoles] = React.useState<any[]>([]);
  const [catalog, setCatalog] = React.useState<PermissionItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any>(null);
  const [permRole, setPermRole] = React.useState<any>(null);
  const [permSearch, setPermSearch] = React.useState('');
  const [pending, setPending] = React.useState<string | null>(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [filters, setFilters] = React.useState<{
    name?: string;
    code?: string;
    is_active?: boolean;
  }>({});

  const groupedCatalog = React.useMemo(() => {
    const q = permSearch.trim().toLowerCase();
    const groups = new Map<string, PermissionItem[]>();
    for (const item of catalog) {
      if (q) {
        const group = intl
          .formatMessage({
            id: `permissions.group.${item.group}`,
            defaultMessage: item.group
          })
          .toLowerCase();
        const desc = intl
          .formatMessage({
            id: `permissions.desc.${item.key}`,
            defaultMessage: item.description
          })
          .toLowerCase();
        if (
          !item.key.toLowerCase().includes(q) &&
          !item.description.toLowerCase().includes(q) &&
          !group.includes(q) &&
          !desc.includes(q)
        ) {
          continue;
        }
      }
      const list = groups.get(item.group) || [];
      list.push(item);
      groups.set(item.group, list);
    }
    return [...groups.entries()];
  }, [catalog, intl, permSearch]);

  const load = async () => {
    const page = await request('/roles', {
      params: { page: 1, perPage: 100, ...filters }
    });
    setRoles(sortCatalogRoles(page.items || []));
  };

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [filters]);

  React.useEffect(() => {
    queryPermissionCatalog()
      .then((items) => setCatalog(items || []))
      .catch(() => undefined);
  }, []);

  const openPermissions = (row: any) => {
    setPermRole(row);
    setPermSearch('');
  };

  const togglePermission = async (permission: string, granted: boolean) => {
    if (!permRole || permRole.builtin || !canWrite) {
      return;
    }
    setPending(permission);
    try {
      const updated = await patchRolePermission(
        permRole.id,
        permission,
        granted
      );
      setPermRole((prev: any) => (prev ? { ...prev, ...updated } : prev));
      setRoles((prev) =>
        prev.map((item) =>
          item.id === permRole.id ? { ...item, ...updated } : item
        )
      );
    } catch {
      message.error(intl.formatMessage({ id: 'permissions.toggle.failed' }));
    } finally {
      setPending(null);
    }
  };

  const save = async () => {
    const values = await form.validateFields();
    const payload = {
      name: values.name,
      code: values.code,
      description: values.description,
      is_active: values.is_active !== false
    };
    if (editing) {
      await request(`/roles/${editing.id}`, { method: 'PUT', data: payload });
    } else {
      await request('/roles', {
        method: 'POST',
        data: {
          ...payload,
          scope: isPlatformAdmin ? 'platform' : 'org'
        }
      });
    }
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const remove = async (id: number) => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'common.button.delete' }),
      onOk: async () => {
        await request(`/roles/${id}`, { method: 'DELETE' });
        load();
      }
    });
  };

  const toggleActive = async (row: any, is_active: boolean) => {
    await request(`/roles/${row.id}`, { method: 'PUT', data: { is_active } });
    load();
  };

  return (
    <PageBox>
      <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
        {intl.formatMessage({ id: 'roles.page.description' })}
      </Typography.Paragraph>
      <Form
        form={filterForm}
        layout="inline"
        style={{ margin: '8px 0 16px', rowGap: 12 }}
        onFinish={(values) =>
          setFilters({
            name: values.name || undefined,
            code: values.code || undefined,
            is_active:
              values.is_active === undefined || values.is_active === ''
                ? undefined
                : values.is_active
          })
        }
      >
        <Form.Item name="name">
          <Input
            allowClear
            style={{ width: 180 }}
            placeholder={intl.formatMessage({
              id: 'roles.form.name.placeholder'
            })}
          />
        </Form.Item>
        <Form.Item name="code">
          <Input
            allowClear
            style={{ width: 180 }}
            placeholder={intl.formatMessage({
              id: 'roles.form.code.placeholder'
            })}
          />
        </Form.Item>
        <Form.Item name="is_active">
          <Select
            allowClear
            style={{ width: 160 }}
            placeholder={intl.formatMessage({
              id: 'roles.form.active.placeholder'
            })}
            options={[
              {
                label: intl.formatMessage({
                  id: 'roles.form.active.on'
                }),
                value: true
              },
              {
                label: intl.formatMessage({
                  id: 'roles.form.active.off'
                }),
                value: false
              }
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button
              onClick={() => {
                filterForm.resetFields();
                setFilters({});
              }}
            >
              {intl.formatMessage({ id: 'common.button.reset' })}
            </Button>
            <Button type="primary" htmlType="submit">
              {intl.formatMessage({ id: 'common.button.search' })}
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Space style={{ margin: '0 0 16px' }}>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            form.setFieldsValue({ is_active: true });
            setOpen(true);
          }}
        >
          {intl.formatMessage({ id: 'roles.add' })}
        </Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={roles}
        onRow={(row) => ({
          style: { cursor: 'pointer' },
          onClick: (event) => {
            const target = event.target as HTMLElement;
            if (target.closest('a, button, .ant-switch')) {
              return;
            }
            openPermissions(row);
          }
        })}
        columns={[
          {
            title: 'ID',
            dataIndex: 'id',
            width: 80
          },
          {
            title: intl.formatMessage({ id: 'roles.form.name' }),
            dataIndex: 'name',
            render: (_name: string, row: any) => (
              <Space>
                <span>
                  {catalogRoleLabel(roleKey(row), intl.formatMessage)}
                </span>
                {row.builtin ? (
                  <Tag>{intl.formatMessage({ id: 'roles.builtin' })}</Tag>
                ) : null}
              </Space>
            )
          },
          {
            title: intl.formatMessage({ id: 'roles.form.code' }),
            dataIndex: 'code',
            render: (_: string, row: any) => roleKey(row)
          },
          {
            title: intl.formatMessage({ id: 'roles.form.active' }),
            dataIndex: 'is_active',
            width: 120,
            render: (active: boolean, row: any) => (
              <Switch
                checked={active !== false}
                disabled={row.builtin}
                checkedChildren={intl.formatMessage({
                  id: 'roles.form.active.on'
                })}
                unCheckedChildren={intl.formatMessage({
                  id: 'roles.form.active.off'
                })}
                onChange={(checked) => toggleActive(row, checked)}
              />
            )
          },
          {
            title: intl.formatMessage({
              id: 'common.table.description'
            }),
            dataIndex: 'description',
            ellipsis: true
          },
          {
            title: intl.formatMessage({
              id: 'common.table.updateTime'
            }),
            dataIndex: 'updated_at',
            width: 180,
            render: (value: string) =>
              value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : ''
          },
          {
            title: intl.formatMessage({
              id: 'common.table.operation'
            }),
            width: 180,
            render: (_: any, row: any) => (
              <Space>
                <a onClick={() => openPermissions(row)}>
                  {intl.formatMessage({ id: 'roles.permissions.action' })}
                </a>
                {row.builtin ? null : (
                  <>
                    <a
                      onClick={() => {
                        setEditing(row);
                        form.setFieldsValue({
                          ...row,
                          is_active: row.is_active !== false
                        });
                        setOpen(true);
                      }}
                    >
                      {intl.formatMessage({
                        id: 'common.button.edit'
                      })}
                    </a>
                    <a onClick={() => remove(row.id)}>
                      {intl.formatMessage({
                        id: 'common.button.delete'
                      })}
                    </a>
                  </>
                )}
              </Space>
            )
          }
        ]}
      />
      <Drawer
        open={open}
        width={520}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={intl.formatMessage({
          id: editing ? 'roles.edit' : 'roles.add'
        })}
        extra={
          <Button type="primary" onClick={save}>
            {intl.formatMessage({ id: 'common.button.save' })}
          </Button>
        }
      >
        <Form form={form} layout="vertical" initialValues={{ is_active: true }}>
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'roles.form.name' })}
            rules={[{ required: true }]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'roles.form.name.placeholder'
              })}
            />
          </Form.Item>
          <Form.Item
            name="code"
            label={intl.formatMessage({ id: 'roles.form.code' })}
            rules={[
              { required: true },
              {
                pattern: /^[A-Za-z][A-Za-z0-9_-]{0,62}$/,
                message: intl.formatMessage({ id: 'roles.form.code.rule' })
              }
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'roles.form.code.placeholder'
              })}
            />
          </Form.Item>
          <Form.Item
            name="is_active"
            label={intl.formatMessage({ id: 'roles.form.active' })}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={intl.formatMessage({
                id: 'roles.form.active.on'
              })}
              unCheckedChildren={intl.formatMessage({
                id: 'roles.form.active.off'
              })}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={intl.formatMessage({ id: 'common.table.description' })}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Drawer>
      <Drawer
        open={!!permRole}
        width={560}
        onClose={() => setPermRole(null)}
        title={intl.formatMessage(
          { id: 'roles.permissions.title' },
          {
            name: permRole
              ? catalogRoleLabel(roleKey(permRole), intl.formatMessage)
              : ''
          }
        )}
      >
        <Typography.Paragraph type="secondary">
          {intl.formatMessage({
            id: permRole?.builtin
              ? 'roles.permissions.builtinHint'
              : 'roles.permissions.hint'
          })}
        </Typography.Paragraph>
        <Input.Search
          allowClear
          style={{ marginBottom: 16 }}
          value={permSearch}
          onChange={(event) => setPermSearch(event.target.value)}
          placeholder={intl.formatMessage({ id: 'permissions.search' })}
        />
        <Checkbox.Group
          style={{ width: '100%' }}
          value={permRole?.permissions || []}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {groupedCatalog.map(([group, items]) => (
              <div key={group}>
                <Typography.Text type="secondary">
                  {intl.formatMessage({
                    id: `permissions.group.${group}`,
                    defaultMessage: group
                  })}
                </Typography.Text>
                <Space
                  direction="vertical"
                  size={4}
                  style={{ display: 'flex', marginTop: 8 }}
                >
                  {items.map((item) => (
                    <Checkbox
                      key={item.key}
                      value={item.key}
                      disabled={
                        !!permRole?.builtin || !canWrite || pending === item.key
                      }
                      onChange={(event) =>
                        togglePermission(item.key, event.target.checked)
                      }
                    >
                      {item.key} —{' '}
                      {intl.formatMessage({
                        id: `permissions.desc.${item.key}`,
                        defaultMessage: item.description
                      })}
                    </Checkbox>
                  ))}
                </Space>
              </div>
            ))}
          </Space>
        </Checkbox.Group>
      </Drawer>
    </PageBox>
  );
};

export default Roles;
