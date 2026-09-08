import { ListEmpty, SectionCard, TableLoadGate } from '@/components/console';
import { PageAction } from '@/config';
import useTableFetch from '@/hooks/use-table-fetch';
import { DeleteModal, FilterBar, IconFont } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Switch,
  Table,
  Tag,
  message
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import React from 'react';
import PageBox from '../_components/page-box';
import {
  createAnnouncement,
  deleteAnnouncement,
  queryAdminAnnouncements,
  updateAnnouncement,
  type AnnouncementItem
} from './apis';

type EditorValues = {
  title: string;
  body: string;
  published: boolean;
  starts_at?: Dayjs | null;
  ends_at?: Dayjs | null;
};

const toIso = (value?: Dayjs | null) => (value ? value.toISOString() : null);

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
  const [form] = Form.useForm<EditorValues>();
  const [editor, setEditor] = React.useState<{
    action: string;
    current?: AnnouncementItem | null;
  }>({ action: PageAction.CREATE });
  const [saving, setSaving] = React.useState(false);

  const resetCreate = () => {
    form.resetFields();
    form.setFieldsValue({ published: true, starts_at: null, ends_at: null });
    setEditor({ action: PageAction.CREATE, current: null });
  };

  React.useEffect(() => {
    resetCreate();
  }, []);

  const openCreate = () => {
    resetCreate();
  };

  const openEdit = (record: AnnouncementItem) => {
    form.setFieldsValue({
      title: record.title,
      body: record.body,
      published: record.published,
      starts_at: record.starts_at ? dayjs(record.starts_at) : null,
      ends_at: record.ends_at ? dayjs(record.ends_at) : null
    });
    setEditor({ action: PageAction.EDIT, current: record });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        title: values.title,
        body: values.body,
        published: values.published,
        starts_at: toIso(values.starts_at),
        ends_at: toIso(values.ends_at)
      };
      if (editor.action === PageAction.EDIT && editor.current) {
        await updateAnnouncement(editor.current.id, payload);
      } else {
        await createAnnouncement(payload);
      }
      message.success(intl.formatMessage({ id: 'common.message.success' }));
      resetCreate();
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageBox>
      <SectionCard
        title={intl.formatMessage({
          id:
            editor.action === PageAction.EDIT
              ? 'announcements.form.currentEdit'
              : 'announcements.form.currentTitle'
        })}
        description={intl.formatMessage({
          id: 'announcements.form.currentDesc'
        })}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="published"
            label={intl.formatMessage({
              id: 'announcements.form.enableTitle'
            })}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="title"
            label={intl.formatMessage({ id: 'announcements.table.title' })}
            rules={[{ required: true }]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'announcements.form.titlePlaceholder'
              })}
            />
          </Form.Item>
          <Form.Item
            name="body"
            label={intl.formatMessage({ id: 'announcements.form.body' })}
            extra={intl.formatMessage({
              id: 'announcements.form.bodyHint'
            })}
            rules={[{ required: true }]}
          >
            <Input.TextArea
              rows={6}
              placeholder={intl.formatMessage({
                id: 'announcements.form.bodyPlaceholder'
              })}
            />
          </Form.Item>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16
            }}
          >
            <Form.Item
              name="starts_at"
              label={intl.formatMessage({
                id: 'announcements.form.startsAt'
              })}
              extra={intl.formatMessage({
                id: 'announcements.form.startsAtHint'
              })}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder={intl.formatMessage({
                  id: 'announcements.form.timeImmediate'
                })}
              />
            </Form.Item>
            <Form.Item
              name="ends_at"
              label={intl.formatMessage({ id: 'announcements.form.endsAt' })}
              extra={intl.formatMessage({
                id: 'announcements.form.endsAtHint'
              })}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder={intl.formatMessage({
                  id: 'announcements.form.timeNever'
                })}
              />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {editor.action === PageAction.EDIT ? (
              <Button onClick={openCreate}>
                {intl.formatMessage({ id: 'common.button.cancel' })}
              </Button>
            ) : null}
            <Button type="primary" loading={saving} onClick={handleOk}>
              {intl.formatMessage({
                id:
                  editor.action === PageAction.EDIT
                    ? 'announcements.button.save'
                    : 'announcements.button.publish'
              })}
            </Button>
          </div>
        </Form>
      </SectionCard>

      <div style={{ marginTop: 16 }}>
        <FilterBar
          marginBottom={16}
          marginTop={0}
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
                title={intl.formatMessage({
                  id: 'announcements.noresult.title'
                })}
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
                  title: intl.formatMessage({
                    id: 'announcements.table.title'
                  }),
                  dataIndex: 'title'
                },
                {
                  title: intl.formatMessage({
                    id: 'announcements.table.status'
                  }),
                  dataIndex: 'published',
                  width: 100,
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
                    id: 'announcements.table.schedule'
                  }),
                  key: 'schedule',
                  width: 280,
                  render: (_: unknown, record: AnnouncementItem) => (
                    <div style={{ fontSize: 12, lineHeight: '20px' }}>
                      <div>
                        {intl.formatMessage({
                          id: 'announcements.form.startsAt'
                        })}
                        :{' '}
                        {record.starts_at
                          ? dayjs(record.starts_at).format('YYYY-MM-DD HH:mm')
                          : intl.formatMessage({
                              id: 'announcements.form.timeImmediate'
                            })}
                      </div>
                      <div>
                        {intl.formatMessage({
                          id: 'announcements.form.endsAt'
                        })}
                        :{' '}
                        {record.ends_at
                          ? dayjs(record.ends_at).format('YYYY-MM-DD HH:mm')
                          : intl.formatMessage({
                              id: 'announcements.form.timeNever'
                            })}
                      </div>
                    </div>
                  )
                },
                {
                  title: intl.formatMessage({
                    id: 'announcements.table.publishedAt'
                  }),
                  dataIndex: 'published_at',
                  width: 160,
                  render: (value?: string) =>
                    value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
                },
                {
                  title: intl.formatMessage({ id: 'common.table.operation' }),
                  key: 'action',
                  width: 140,
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
      </div>
      <DeleteModal ref={modalRef} />
    </PageBox>
  );
};

export default AnnouncementsAdmin;
