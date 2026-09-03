import { TABLE_SORT_DIRECTIONS } from '@/config/settings';
import { loadEnterprisePeople, type PersonOption } from '@/enterprise/people';
import useTableFetch from '@/hooks/use-table-fetch';
import {
  DeleteModal,
  FilterBar,
  FormDrawer,
  IconFont,
  NoResult
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
  message
} from 'antd';
import _ from 'lodash';
import React from 'react';
import PageBox from '../_components/page-box';

interface OrgItem {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  is_platform?: boolean;
  created_at: string;
}

const API = '/organizations';

const EnterpriseOrganizations: React.FC = () => {
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
  } = useTableFetch<OrgItem>({
    fetchAPI: (params) => request(API, { method: 'GET', params }),
    deleteAPI: (id) => request(`${API}/${id}`, { method: 'DELETE' }),
    watch: false,
    contentForDelete: intl.formatMessage({ id: 'orgs.item' })
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<OrgItem | null>(null);
  const [membersOpen, setMembersOpen] = React.useState(false);
  const [activeOrg, setActiveOrg] = React.useState<OrgItem | null>(null);
  const [members, setMembers] = React.useState<any[]>([]);
  const [memberForm] = Form.useForm();
  const [people, setPeople] = React.useState<PersonOption[]>([]);

  const loadMembers = async (orgId: number) => {
    const rows = await request(`/organizations/${orgId}/members`);
    setMembers(Array.isArray(rows) ? rows : []);
  };

  const openMembers = async (row: OrgItem) => {
    setActiveOrg(row);
    setMembersOpen(true);
    await loadMembers(row.id);
  };

  React.useEffect(() => {
    loadEnterprisePeople()
      .then(setPeople)
      .catch(() => undefined);
  }, []);

  const addMember = async () => {
    if (!activeOrg) return;
    const values = await memberForm.validateFields();
    await request(`/organizations/${activeOrg.id}/members`, {
      method: 'POST',
      data: {
        principal_ids: [Number(values.principal_id)],
        role: values.role
      }
    });
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    memberForm.resetFields();
    loadMembers(activeOrg.id);
  };

  const removeMember = async (principalId: number) => {
    if (!activeOrg) return;
    await request(`/organizations/${activeOrg.id}/members/${principalId}`, {
      method: 'DELETE'
    });
    loadMembers(activeOrg.id);
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

  return (
    <>
      <PageBox>
        <FilterBar
          marginBottom={22}
          showSelect={false}
          inputHolder={intl.formatMessage({ id: 'orgs.filter.name' })}
          buttonText={intl.formatMessage({ id: 'orgs.add' })}
          handleSearch={handleSearch}
          handleDeleteByBatch={handleDeleteBatch}
          handleClickPrimary={handleAdd}
          handleInputChange={handleNameChange}
          rowSelection={rowSelection}
        />
        <ConfigProvider
          renderEmpty={(type) =>
            type === 'Table' ? (
              <NoResult
                loading={dataSource.loading}
                loadend={dataSource.loadend}
                dataSource={dataSource.dataList}
                image={<IconFont type="icon-org-outlined" />}
                filters={_.pick(queryParams, ['search'])}
                title={intl.formatMessage({ id: 'orgs.noresult.title' })}
                subTitle={intl.formatMessage({ id: 'orgs.noresult.subTitle' })}
                onClick={handleAdd}
                buttonText={intl.formatMessage({ id: 'noresult.button.add' })}
              />
            ) : undefined
          }
        >
          <Table
            className="scroll-table"
            rowKey="id"
            dataSource={dataSource.dataList}
            rowSelection={rowSelection}
            loading={{ spinning: dataSource.loading }}
            sortDirections={TABLE_SORT_DIRECTIONS}
            onChange={handleTableChange}
            columns={[
              {
                title: intl.formatMessage({ id: 'common.table.name' }),
                dataIndex: 'name'
              },
              {
                title: intl.formatMessage({ id: 'common.table.displayName' }),
                dataIndex: 'display_name'
              },
              {
                title: intl.formatMessage({ id: 'common.table.description' }),
                dataIndex: 'description'
              },
              {
                title: intl.formatMessage({ id: 'common.table.operation' }),
                render: (_: any, row: OrgItem) => (
                  <Space>
                    <a
                      onClick={() => {
                        setEditing(row);
                        form.setFieldsValue(row);
                        setOpen(true);
                      }}
                    >
                      {intl.formatMessage({ id: 'common.button.edit' })}
                    </a>
                    <a onClick={() => openMembers(row)}>
                      {intl.formatMessage({ id: 'orgs.members' })}
                    </a>
                    {row.is_platform ? null : (
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
                    )}
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
      </PageBox>
      <FormDrawer
        title={intl.formatMessage({
          id: editing ? 'orgs.edit' : 'orgs.add'
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
            name="name"
            label={intl.formatMessage({ id: 'orgs.form.name' })}
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
      </FormDrawer>
      <DeleteModal ref={modalRef} />
      <Drawer
        open={membersOpen}
        width={560}
        onClose={() => setMembersOpen(false)}
        title={intl.formatMessage(
          { id: 'orgs.members.title' },
          { name: activeOrg?.display_name || activeOrg?.name }
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
                id: 'orgs.members.user'
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
                  label: intl.formatMessage({ id: 'orgs.members.owner' }),
                  value: 'owner'
                },
                {
                  label: intl.formatMessage({ id: 'orgs.members.member' }),
                  value: 'member'
                }
              ]}
            />
          </Form.Item>
          <Button type="primary" onClick={addMember}>
            {intl.formatMessage({ id: 'orgs.members.add' })}
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

export default EnterpriseOrganizations;
