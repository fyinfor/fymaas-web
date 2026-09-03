import { PageAction } from '@/config';
import { TABLE_SORT_DIRECTIONS } from '@/config/settings';
import { PageActionType } from '@/config/types';
import { loadEnterprisePeople, type PersonOption } from '@/enterprise/people';
import useTableFetch from '@/hooks/use-table-fetch';
import { queryApisKeysList } from '@/pages/api-keys/apis';
import { queryModelsList } from '@/pages/llmodels/apis';
import { queryModelRoutes } from '@/pages/model-routes/apis';
import {
  DeleteModal,
  FilterBar,
  FormDrawer,
  IconFont,
  NoResult
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import {
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  Progress,
  Select,
  Switch,
  Table,
  Tabs,
  Tag,
  message
} from 'antd';
import _ from 'lodash';
import React from 'react';
import PageBox from '../_components/page-box';
import {
  createNotificationChannel,
  createQuotaPolicy,
  deleteNotificationChannel,
  deleteQuotaPolicy,
  queryNotificationChannels,
  queryQuotaPolicies,
  updateQuotaPolicy
} from './apis';
import { ChannelForm, ChannelItem, FormData, ListItem } from './config/types';

const Quotas: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm<FormData>();
  const [channelForm] = Form.useForm<ChannelForm>();
  const [channels, setChannels] = React.useState<ChannelItem[]>([]);
  const [channelOpen, setChannelOpen] = React.useState(false);
  const [people, setPeople] = React.useState<PersonOption[]>([]);
  const [models, setModels] = React.useState<{ id: number; name: string }[]>(
    []
  );
  const [routes, setRoutes] = React.useState<{ id: number; name: string }[]>(
    []
  );
  const [apiKeys, setApiKeys] = React.useState<{ id: number; name: string }[]>(
    []
  );
  const subjectType = Form.useWatch('subject_type', form);
  const targetType = Form.useWatch('target_type', form);
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
  } = useTableFetch<ListItem>({
    fetchAPI: queryQuotaPolicies,
    deleteAPI: deleteQuotaPolicy,
    watch: false,
    contentForDelete: intl.formatMessage({ id: 'quotas.policy' })
  });

  const [modal, setModal] = React.useState<{
    open: boolean;
    action: PageActionType;
    data?: ListItem | null;
  }>({ open: false, action: PageAction.CREATE });

  const loadChannels = async () => {
    const page = await queryNotificationChannels();
    setChannels(page.items || []);
  };

  React.useEffect(() => {
    loadChannels().catch(() => undefined);
    queryModelRoutes({ page: 1, perPage: 100 })
      .then((page) => setRoutes(page.items || []))
      .catch(() => undefined);
    queryModelsList({ page: 1, perPage: 100 })
      .then((page) =>
        setModels(
          (page.items || []).map((item: any) => ({
            id: item.id,
            name: item.name || String(item.id)
          }))
        )
      )
      .catch(() => undefined);
    queryApisKeysList({ page: 1, perPage: 100 })
      .then((page) =>
        setApiKeys(
          (page.items || []).map((item: any) => ({
            id: item.id,
            name: item.name || String(item.id)
          }))
        )
      )
      .catch(() => undefined);
    loadEnterprisePeople()
      .then(setPeople)
      .catch(() => undefined);
  }, []);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      subject_type: 'org',
      target_type: 'all',
      quota_period: 'month',
      token_rate_window_seconds: 60,
      request_rate_window_seconds: 60,
      alert_threshold_percent: 80
    });
    setModal({ open: true, action: PageAction.CREATE, data: null });
  };

  const handleSelect = useMemoizedFn((val: string, row: ListItem) => {
    if (val === 'edit') {
      form.setFieldsValue(row);
      setModal({ open: true, action: PageAction.EDIT, data: row });
    } else if (val === 'delete') {
      handleDelete({ ...row, name: row.name });
    }
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      if (modal.action === PageAction.EDIT && modal.data) {
        await updateQuotaPolicy(modal.data.id, values);
      } else {
        await createQuotaPolicy(values);
      }
      message.success(intl.formatMessage({ id: 'common.message.success' }));
      setModal({ open: false, action: PageAction.CREATE });
      fetchData();
    } catch (error) {
      // interceptor
    }
  };

  const saveChannel = async () => {
    const values = await channelForm.validateFields();
    await createNotificationChannel(values);
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    setChannelOpen(false);
    channelForm.resetFields();
    loadChannels();
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'common.table.name' }),
      dataIndex: 'name'
    },
    {
      title: intl.formatMessage({ id: 'quotas.table.subject' }),
      render: (_: any, row: ListItem) => {
        const typeKey =
          row.subject_type === 'api_key'
            ? 'quotas.subject.apiKey'
            : `quotas.subject.${row.subject_type}`;
        const typeLabel = intl.formatMessage({
          id: typeKey,
          defaultMessage: row.subject_type
        });
        let extra = '';
        if (row.subject_type === 'user' || row.subject_type === 'group') {
          extra =
            people.find((item) => item.id === row.subject_principal_id)
              ?.name || '';
        } else if (row.subject_type === 'api_key') {
          extra =
            apiKeys.find((item) => item.id === row.api_key_id)?.name || '';
        }
        return extra ? `${typeLabel} · ${extra}` : typeLabel;
      }
    },
    {
      title: intl.formatMessage({ id: 'quotas.form.target' }),
      render: (_: any, row: ListItem) => {
        const typeKey =
          row.target_type === 'model_route'
            ? 'quotas.target.route'
            : `quotas.target.${row.target_type}`;
        const typeLabel = intl.formatMessage({
          id: typeKey,
          defaultMessage: row.target_type
        });
        let extra = '';
        if (row.target_type === 'model') {
          extra =
            models.find((item) => item.id === row.target_id)?.name || '';
        } else if (row.target_type === 'model_route') {
          extra =
            routes.find((item) => item.id === row.target_id)?.name || '';
        }
        return extra ? `${typeLabel} · ${extra}` : typeLabel;
      }
    },
    {
      title: intl.formatMessage({ id: 'quotas.table.usage' }),
      render: (_: any, row: ListItem) =>
        row.token_quota ? (
          <Progress
            percent={Math.min(100, row.used_percent || 0)}
            size="small"
            format={() => `${row.used_tokens}/${row.token_quota}`}
          />
        ) : (
          '-'
        )
    },
    {
      title: intl.formatMessage({ id: 'quotas.form.enabled' }),
      dataIndex: 'enabled',
      render: (v: boolean) => (
        <Tag color={v ? 'success' : 'default'}>
          {v
            ? intl.formatMessage({ id: 'common.button.enable' })
            : intl.formatMessage({ id: 'common.button.disable' })}
        </Tag>
      )
    },
    {
      title: intl.formatMessage({ id: 'common.table.operation' }),
      render: (_: any, row: ListItem) => (
        <a onClick={() => handleSelect('edit', row)}>
          {intl.formatMessage({ id: 'common.button.edit' })}
        </a>
      )
    }
  ];

  return (
    <>
      <PageBox>
        <Tabs
          items={[
            {
              key: 'policies',
              label: intl.formatMessage({ id: 'quotas.tab.policies' }),
              children: (
                <>
                  <FilterBar
                    marginBottom={22}
                    showSelect={false}
                    inputHolder={intl.formatMessage({
                      id: 'quotas.filter.name'
                    })}
                    buttonText={intl.formatMessage({ id: 'quotas.policy.add' })}
                    handleSearch={handleSearch}
                    handleDeleteByBatch={handleDeleteBatch}
                    handleClickPrimary={openCreate}
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
                          image={<IconFont type="icon-usage-outlined" />}
                          filters={_.pick(queryParams, ['search'])}
                          title={intl.formatMessage({
                            id: 'quotas.noresult.title'
                          })}
                          subTitle={intl.formatMessage({
                            id: 'quotas.noresult.subTitle'
                          })}
                          onClick={openCreate}
                          buttonText={intl.formatMessage({
                            id: 'noresult.button.add'
                          })}
                        />
                      ) : undefined
                    }
                  >
                    <Table
                      className="scroll-table"
                      rowKey="id"
                      columns={columns}
                      dataSource={dataSource.dataList}
                      rowSelection={rowSelection}
                      loading={{ spinning: dataSource.loading }}
                      sortDirections={TABLE_SORT_DIRECTIONS}
                      onChange={handleTableChange}
                      pagination={{
                        showSizeChanger: true,
                        pageSize: queryParams.perPage,
                        current: queryParams.page,
                        total: dataSource.total,
                        onChange: handlePageChange
                      }}
                    />
                  </ConfigProvider>
                </>
              )
            },
            {
              key: 'channels',
              label: intl.formatMessage({ id: 'quotas.tab.channels' }),
              children: (
                <>
                  <FilterBar
                    marginBottom={22}
                    showSelect={false}
                    buttonText={intl.formatMessage({
                      id: 'quotas.channel.add'
                    })}
                    handleSearch={() => undefined}
                    handleClickPrimary={() => {
                      channelForm.resetFields();
                      channelForm.setFieldsValue({
                        channel_type: 'webhook',
                        enabled: true
                      });
                      setChannelOpen(true);
                    }}
                  />
                  <Table
                    rowKey="id"
                    dataSource={channels}
                    columns={[
                      {
                        title: intl.formatMessage({ id: 'common.table.name' }),
                        dataIndex: 'name'
                      },
                      {
                        title: intl.formatMessage({
                          id: 'quotas.form.channel'
                        }),
                        dataIndex: 'channel_type'
                      },
                      {
                        title: intl.formatMessage({
                          id: 'common.table.operation'
                        }),
                        render: (_: any, row: ChannelItem) => (
                          <a
                            onClick={async () => {
                              await deleteNotificationChannel(row.id);
                              loadChannels();
                            }}
                          >
                            {intl.formatMessage({
                              id: 'common.button.delete'
                            })}
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
      </PageBox>
      <FormDrawer
        title={intl.formatMessage({
          id:
            modal.action === PageAction.EDIT
              ? 'quotas.policy.edit'
              : 'quotas.policy.add'
        })}
        open={modal.open}
        onCancel={() => setModal({ open: false, action: PageAction.CREATE })}
        onSubmit={handleOk}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'common.table.name' })}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="subject_type"
            label={intl.formatMessage({ id: 'quotas.form.subject' })}
          >
            <Select
              options={[
                {
                  value: 'org',
                  label: intl.formatMessage({ id: 'quotas.subject.org' })
                },
                {
                  value: 'user',
                  label: intl.formatMessage({ id: 'quotas.subject.user' })
                },
                {
                  value: 'api_key',
                  label: intl.formatMessage({ id: 'quotas.subject.apiKey' })
                },
                {
                  value: 'group',
                  label: intl.formatMessage({ id: 'quotas.subject.group' })
                }
              ]}
            />
          </Form.Item>
          {subjectType === 'user' || subjectType === 'group' ? (
            <Form.Item
              name="subject_principal_id"
              label={intl.formatMessage({ id: 'quotas.form.subjectId' })}
            >
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                options={people.map((item) => ({
                  label: item.name,
                  value: item.id
                }))}
              />
            </Form.Item>
          ) : null}
          {subjectType === 'api_key' ? (
            <Form.Item
              name="api_key_id"
              label={intl.formatMessage({ id: 'quotas.form.apiKeyId' })}
            >
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                options={apiKeys.map((item) => ({
                  label: item.name,
                  value: item.id
                }))}
              />
            </Form.Item>
          ) : null}
          <Form.Item
            name="target_type"
            label={intl.formatMessage({ id: 'quotas.form.target' })}
          >
            <Select
              options={[
                {
                  value: 'all',
                  label: intl.formatMessage({ id: 'quotas.target.all' })
                },
                {
                  value: 'model',
                  label: intl.formatMessage({ id: 'quotas.target.model' })
                },
                {
                  value: 'model_route',
                  label: intl.formatMessage({ id: 'quotas.target.route' })
                }
              ]}
            />
          </Form.Item>
          {targetType === 'model_route' ? (
            <Form.Item
              name="target_id"
              label={intl.formatMessage({ id: 'quotas.form.targetId' })}
            >
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                options={routes.map((item) => ({
                  label: item.name,
                  value: item.id
                }))}
              />
            </Form.Item>
          ) : targetType === 'model' ? (
            <Form.Item
              name="target_id"
              label={intl.formatMessage({ id: 'quotas.form.targetId' })}
            >
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                options={models.map((item) => ({
                  label: item.name,
                  value: item.id
                }))}
              />
            </Form.Item>
          ) : null}
          <Form.Item
            name="token_quota"
            label={intl.formatMessage({ id: 'quotas.form.tokenQuota' })}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="quota_period"
            label={intl.formatMessage({ id: 'quotas.form.period' })}
          >
            <Select
              options={[
                {
                  value: 'day',
                  label: intl.formatMessage({ id: 'quotas.period.day' })
                },
                {
                  value: 'week',
                  label: intl.formatMessage({ id: 'quotas.period.week' })
                },
                {
                  value: 'month',
                  label: intl.formatMessage({ id: 'quotas.period.month' })
                }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="token_rate_limit"
            label={intl.formatMessage({ id: 'quotas.form.tokenRate' })}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="token_rate_window_seconds"
            label={intl.formatMessage({ id: 'quotas.form.tokenWindow' })}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item
            name="request_rate_limit"
            label={intl.formatMessage({ id: 'quotas.form.requestRate' })}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="request_rate_window_seconds"
            label={intl.formatMessage({ id: 'quotas.form.requestWindow' })}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item
            name="notification_channel_id"
            label={intl.formatMessage({ id: 'quotas.form.channel' })}
          >
            <Select
              allowClear
              options={channels.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item
            name="alert_threshold_percent"
            label={intl.formatMessage({ id: 'quotas.form.alert' })}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={100} />
          </Form.Item>
          <Form.Item
            name="enabled"
            valuePropName="checked"
            label={intl.formatMessage({ id: 'quotas.form.enabled' })}
          >
            <Switch />
          </Form.Item>
        </Form>
      </FormDrawer>
      <FormDrawer
        title={intl.formatMessage({ id: 'quotas.channel.add' })}
        open={channelOpen}
        onCancel={() => setChannelOpen(false)}
        onSubmit={saveChannel}
        width={480}
      >
        <Form form={channelForm} layout="vertical">
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'common.table.name' })}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="channel_type"
            label={intl.formatMessage({ id: 'quotas.form.channel' })}
          >
            <Select
              options={[
                {
                  value: 'webhook',
                  label: intl.formatMessage({ id: 'quotas.channel.webhook' })
                },
                {
                  value: 'email',
                  label: intl.formatMessage({ id: 'quotas.channel.email' })
                }
              ]}
            />
          </Form.Item>
          <Form.Item name="webhook_url" label="Webhook URL">
            <Input />
          </Form.Item>
          <Form.Item name="email_to" label="Email">
            <Input />
          </Form.Item>
          <Form.Item
            name="enabled"
            valuePropName="checked"
            label={intl.formatMessage({ id: 'quotas.form.enabled' })}
          >
            <Switch />
          </Form.Item>
        </Form>
      </FormDrawer>
      <DeleteModal ref={modalRef} />
    </>
  );
};

export default Quotas;
