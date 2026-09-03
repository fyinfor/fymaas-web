import { PageAction } from '@/config';
import { TABLE_SORT_DIRECTIONS } from '@/config/settings';
import { PageActionType } from '@/config/types';
import useTableFetch from '@/hooks/use-table-fetch';
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
  message
} from 'antd';
import _ from 'lodash';
import React from 'react';
import PageBox from '../_components/page-box';
import {
  createQuotaPolicy,
  deleteQuotaPolicy,
  queryQuotaPolicies,
  updateQuotaPolicy
} from './apis';
import { FormData, ListItem } from './config/types';

const Quotas: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm<FormData>();
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

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      subject_type: 'org',
      target_type: 'all',
      quota_period: 'month',
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

  const columns = [
    {
      title: intl.formatMessage({ id: 'common.table.name' }),
      dataIndex: 'name'
    },
    {
      title: intl.formatMessage({ id: 'quotas.table.subject' }),
      dataIndex: 'subject_type'
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
      render: (v: boolean) =>
        v
          ? intl.formatMessage({ id: 'common.button.enable' })
          : intl.formatMessage({ id: 'common.button.disable' })
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
        <FilterBar
          marginBottom={22}
          showSelect={false}
          inputHolder={intl.formatMessage({ id: 'quotas.filter.name' })}
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
                title={intl.formatMessage({ id: 'quotas.noresult.title' })}
                subTitle={intl.formatMessage({
                  id: 'quotas.noresult.subTitle'
                })}
                onClick={openCreate}
                buttonText={intl.formatMessage({ id: 'noresult.button.add' })}
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
        width={520}
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
                }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="subject_principal_id"
            label={intl.formatMessage({ id: 'quotas.form.subjectId' })}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
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
            name="request_rate_limit"
            label={intl.formatMessage({ id: 'quotas.form.requestRate' })}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
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
      <DeleteModal ref={modalRef} />
    </>
  );
};

export default Quotas;
