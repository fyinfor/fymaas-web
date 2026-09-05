import { ListEmpty, TableLoadGate } from '@/components/console';
import { PageAction } from '@/config';
import useTableFetch from '@/hooks/use-table-fetch';
import { DeleteModal, FilterBar, IconFont } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Switch,
  Table,
  Tag,
  message
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import PageBox from '../_components/page-box';
import {
  createAnnouncement,
  deleteAnnouncement,
  queryAdminAnnouncements,
  updateAnnouncement,
  type AnnouncementItem
} from './apis';

const AnnouncementsAdmin: React.FC = () => {
  const intl = useIntl();
  const {
    dataSource,
    queryParams,
    handlePageChange,
    handleTableChange,
    handleNameChange,
    fetchData,
    handleDelete,
    handleSearch,
    modalRef
  } = useTableFetch<AnnouncementItem>({
    fetchAPI: queryAdminAnnouncements,
    deleteAPI: (id) => deleteAnnouncement(id),
    watch: false,
    contentForDelete: 'announcements.table.title'
  });
  const [form] = Form.useForm();
  const [editor, setEditor] = React.useState<{
    open: boolean;
    action: string;
    current?: AnnouncementItem | null;
  }>({ open: false, action: PageAction.CREATE });

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ published: true });
    setEditor({ open: true, action: PageAction.CREATE, current: null });
  };

  const openEdit = (record: AnnouncementItem) => {
    form.setFieldsValue({
      title: record.title,
      body: record.body,
      published: record.published
    });
    setEditor({ open: true, action: PageAction.EDIT, current: record });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editor.action === PageAction.EDIT && editor.current) {
      await updateAnnouncement(editor.current.id, values);
    } else {
      await createAnnouncement(values);
    }
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    setEditor({ open: false, action: PageAction.CREATE });
    fetchData();
  };

  return (
    <PageBox>
      <FilterBar
        marginBottom={22}
        marginTop={30}
        buttonText={intl.formatMessage({ id: 'announcements.button.add' })}
        handleClickPrimary={openCreate}
        handleInputChange={handleNameChange}
        handleSearch={handleSearch}
      />
      <TableLoadGate
        loading={dataSource.loading}
        loadend={dataSource.loadend}
        error={dataSource.error}
        hasRows={!!dataSource.dataList.length}
        onRetry={() => fetchData()}
      >
        <ConfigProvider
          renderEmpty={() => (
            <ListEmpty
              icon={<IconFont type="icon-logs" />}
              title={intl.formatMessage({ id: 'announcements.noresult.title' })}
              description={intl.formatMessage({
                id: 'announcements.noresult.subTitle'
              })}
            />
          )}
        >
          <Table
            rowKey="id"
            columns={[
              {
                title: intl.formatMessage({ id: 'announcements.table.title' }),
                dataIndex: 'title'
              },
              {
                title: intl.formatMessage({ id: 'announcements.table.status' }),
                dataIndex: 'published',
                width: 120,
                render: (published: boolean) => (
                  <Tag color={published ? 'success' : 'default'}>
                    {intl.formatMessage({
                      id: published
                        ? 'announcements.status.published'
                        : 'announcements.status.draft'
                    })}
                  </Tag>
                )
              },
              {
                title: intl.formatMessage({
                  id: 'announcements.table.publishedAt'
                }),
                dataIndex: 'published_at',
                width: 180,
                render: (value?: string) =>
                  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
              },
              {
                title: intl.formatMessage({ id: 'common.table.operation' }),
                key: 'action',
                width: 160,
                render: (_: unknown, record: AnnouncementItem) => (
                  <>
                    <Button type="link" onClick={() => openEdit(record)}>
                      {intl.formatMessage({ id: 'common.button.edit' })}
                    </Button>
                    <Button
                      type="link"
                      danger
                      onClick={() => handleDelete(record)}
                    >
                      {intl.formatMessage({ id: 'common.button.delete' })}
                    </Button>
                  </>
                )
              }
            ]}
            dataSource={dataSource.dataList}
            loading={false}
            onChange={handleTableChange}
            pagination={{
              current: queryParams.page,
              pageSize: queryParams.perPage,
              total: dataSource.total,
              onChange: handlePageChange
            }}
          />
        </ConfigProvider>
      </TableLoadGate>
      <DeleteModal ref={modalRef} />
      <Modal
        open={editor.open}
        title={intl.formatMessage({
          id:
            editor.action === PageAction.EDIT
              ? 'announcements.button.edit'
              : 'announcements.button.add'
        })}
        onCancel={() => setEditor({ open: false, action: PageAction.CREATE })}
        onOk={handleOk}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label={intl.formatMessage({ id: 'announcements.table.title' })}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="body"
            label={intl.formatMessage({ id: 'announcements.form.body' })}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item
            name="published"
            label={intl.formatMessage({ id: 'announcements.form.published' })}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageBox>
  );
};

export default AnnouncementsAdmin;
