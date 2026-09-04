import { ListEmpty, TableLoadGate } from '@/components/console';
import { TABLE_SORT_DIRECTIONS } from '@/config/settings';
import { loadEnterprisePeople, type PersonOption } from '@/enterprise/people';
import useTableFetch from '@/hooks/use-table-fetch';
import {
  DeleteModal,
  FilterBar,
  FormDrawer,
  IconFont
} from '@gpustack/core-ui';
import { request, useIntl } from '@umijs/max';
import {
  Button,
  ConfigProvider,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  message
} from 'antd';
import React from 'react';
import PageBox from '../_components/page-box';

interface WorkspaceItem {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  organization_id?: number;
  organization?: { id: number; name?: string; display_name?: string };
  is_default?: boolean;
  created_at: string;
}

const API = '/workspaces';

const EnterpriseWorkspaces: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const {
    dataSource,
    rowSelection,
    queryParams,
    modalRef,
    handleDelete,
    handleDeleteBatch,
    fetchData,
    handlePageChange,
    handleTableChange,
    handleSearch,
    handleNameChange
  } = useTableFetch<WorkspaceItem>({
    fetchAPI: (params) => request(API, { method: 'GET', params }),
    deleteAPI: (id) => request(`${API}/${id}`, { method: 'DELETE' }),
    watch: false,
    contentForDelete: intl.formatMessage({ id: 'workspaces.item' })
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<WorkspaceItem | null>(null);
  const [membersOpen, setMembersOpen] = React.useState(false);
  const [active, setActive] = React.useState<WorkspaceItem | null>(null);
  const [members, setMembers] = React.useState<any[]>([]);
  const [memberForm] = Form.useForm();
  const [people, setPeople] = React.useState<PersonOption[]>([]);
  const [orgs, setOrgs] = React.useState<{ id: number; name: string }[]>([]);

  const loadMembers = async (id: number) => {
    const rows = await request(`${API}/${id}/members`);
    setMembers(Array.isArray(rows) ? rows : []);
  };

  const openMembers = async (row: WorkspaceItem) => {
    setActive(row);
    setMembersOpen(true);
    await loadMembers(row.id);
  };

  React.useEffect(() => {
    const search = window.location.hash.split('?')[1] || '';
    if (new URLSearchParams(search).get('create') === '1') {
      form.resetFields();
      setEditing(null);
      setOpen(true);
    }
  }, [form]);

  React.useEffect(() => {
    loadEnterprisePeople()
      .then(setPeople)
      .catch(() => undefined);
    request('/organization-directory', { params: { page: 1, perPage: 100 } })
      .then((page) =>
        setOrgs(
          (page.items || []).map((item: any) => ({
            id: item.id,
            name: item.display_name || item.name
          }))
        )
      )
      .catch(() => undefined);
  }, []);

  const addMember = async () => {
    if (!active) return;
    const values = await memberForm.validateFields();
    await request(`${API}/${active.id}/members`, {
      method: 'POST',
      data: {
        principal_ids: [Number(values.principal_id)],
        role: values.role
      }
    });
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    memberForm.resetFields();
    loadMembers(active.id);
  };

  const removeMember = async (principalId: number) => {
    if (!active) return;
    await request(`${API}/${active.id}/members/${principalId}`, {
      method: 'DELETE'
    });
    loadMembers(active.id);
  };

  const handleAdd = () => {
    form.resetFields();
    setEditing(null);
    setOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) {
      await request(`${API}/${editing.id}`, { method: 'PUT', data: values });
    } else {
      await request(API, { method: 'POST', data: values });
    }
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    setOpen(false);
    setEditing(null);
    fetchData();
  };

  const setDefault = async (row: WorkspaceItem) => {
    await request(`${API}/${row.id}/default`, { method: 'POST' });
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    fetchData();
  };

  return (
    <>
      <PageBox>
        <FilterBar
          marginBottom={22}
          showSelect={false}
          inputHolder={intl.formatMessage({ id: 'workspaces.filter.name' })}
          buttonText={intl.formatMessage({ id: 'workspaces.add' })}
          handleSearch={handleSearch}
          handleDeleteByBatch={handleDeleteBatch}
          handleClickPrimary={handleAdd}
          handleInputChange={handleNameChange}
          rowSelection={rowSelection}
        />
        <TableLoadGate
          loading={dataSource.loading}
          loadend={dataSource.loadend}
          error={dataSource.error}
          hasRows={!!dataSource.dataList.length}
          onRetry={() => fetchData()}
        >
          <ConfigProvider
            renderEmpty={(type) =>
              type === 'Table' ? (
                <ListEmpty
                  icon={<IconFont type="icon-org-outlined" />}
                  title={intl.formatMessage({
                    id: 'workspaces.noresult.title'
                  })}
                  description={intl.formatMessage({
                    id: 'workspaces.noresult.subTitle'
                  })}
                  queryParams={{ search: queryParams.search }}
                  onAdd={handleAdd}
                  addText={intl.formatMessage({ id: 'noresult.button.add' })}
                />
              ) : undefined
            }
          >
            <Table
              className="scroll-table"
              rowKey="id"
              dataSource={dataSource.dataList}
              rowSelection={rowSelection}
              loading={false}
              sortDirections={TABLE_SORT_DIRECTIONS}
              onChange={handleTableChange}
              columns={[
                {
                  title: intl.formatMessage({ id: 'common.table.name' }),
                  dataIndex: 'name',
                  render: (name: string, row: WorkspaceItem) => (
                    <Space>
                      <span>{name}</span>
                      {row.is_default ? (
                        <Tag color="blue">
                          {intl.formatMessage({ id: 'workspaces.default' })}
                        </Tag>
                      ) : null}
                    </Space>
                  )
                },
                {
                  title: intl.formatMessage({ id: 'common.table.displayName' }),
                  dataIndex: 'display_name'
                },
                {
                  title: intl.formatMessage({ id: 'workspaces.org' }),
                  render: (_: any, row: WorkspaceItem) =>
                    row.organization?.display_name ||
                    row.organization?.name ||
                    row.organization_id
                },
                {
                  title: intl.formatMessage({ id: 'common.table.operation' }),
                  render: (_: any, row: WorkspaceItem) => (
                    <Space>
                      <a
                        onClick={() => {
                          setEditing(row);
                          form.setFieldsValue({
                            ...row,
                            organization_id: row.organization_id
                          });
                          setOpen(true);
                        }}
                      >
                        {intl.formatMessage({ id: 'common.button.edit' })}
                      </a>
                      <a onClick={() => openMembers(row)}>
                        {intl.formatMessage({ id: 'workspaces.members' })}
                      </a>
                      {!row.is_default ? (
                        <a onClick={() => setDefault(row)}>
                          {intl.formatMessage({ id: 'workspaces.setDefault' })}
                        </a>
                      ) : null}
                      <a
                        onClick={() =>
                          handleDelete({
                            ...row,
                            name: row.display_name || row.name
                          })
                        }
                      >
                        {intl.formatMessage({ id: 'common.button.delete' })}
                      </a>
                    </Space>
                  )
                }
              ]}
              pagination={{
                showSizeChanger: true,
                pageSize: queryParams.perPage,
                current: queryParams.page,
                total: dataSource.total,
                onChange: handlePageChange
              }}
            />
          </ConfigProvider>
        </TableLoadGate>
      </PageBox>
      <FormDrawer
        title={intl.formatMessage({
          id: editing ? 'workspaces.edit' : 'workspaces.add'
        })}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSubmit={handleOk}
        width={480}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="organization_id"
            label={intl.formatMessage({ id: 'workspaces.org' })}
            rules={[{ required: !editing }]}
            hidden={!!editing}
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
            rules={[{ required: !editing }]}
            hidden={!!editing}
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
      </FormDrawer>
      <DeleteModal ref={modalRef} />
      <Drawer
        open={membersOpen}
        width={560}
        onClose={() => setMembersOpen(false)}
        title={intl.formatMessage(
          { id: 'workspaces.members.title' },
          { name: active?.display_name || active?.name }
        )}
      >
        <Form
          form={memberForm}
          layout="inline"
          style={{ marginBottom: 16 }}
          initialValues={{ role: 'member' }}
        >
          <Form.Item name="principal_id" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              style={{ minWidth: 220 }}
              placeholder={intl.formatMessage({
                id: 'workspaces.members.user'
              })}
              options={people.map((item) => ({
                label: item.name,
                value: item.id
              }))}
            />
          </Form.Item>
          <Form.Item name="role">
            <Select
              style={{ width: 120 }}
              options={[
                {
                  label: intl.formatMessage({ id: 'workspaces.members.owner' }),
                  value: 'owner'
                },
                {
                  label: intl.formatMessage({
                    id: 'workspaces.members.member'
                  }),
                  value: 'member'
                }
              ]}
            />
          </Form.Item>
          <Button type="primary" onClick={addMember}>
            {intl.formatMessage({ id: 'workspaces.members.add' })}
          </Button>
        </Form>
        <Table
          rowKey="principal_id"
          dataSource={members}
          pagination={false}
          columns={[
            {
              title: intl.formatMessage({ id: 'common.table.name' }),
              dataIndex: 'principal_name'
            },
            {
              title: intl.formatMessage({ id: 'common.table.displayName' }),
              dataIndex: 'principal_display_name'
            },
            {
              title: intl.formatMessage({ id: 'roles.scope' }),
              dataIndex: 'role'
            },
            {
              title: intl.formatMessage({ id: 'common.table.operation' }),
              render: (_: any, row: any) => (
                <a onClick={() => removeMember(row.principal_id)}>
                  {intl.formatMessage({ id: 'common.button.delete' })}
                </a>
              )
            }
          ]}
        />
      </Drawer>
    </>
  );
};

export default EnterpriseWorkspaces;
