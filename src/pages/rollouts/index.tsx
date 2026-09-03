import { request, useIntl } from '@umijs/max';
import { Button, Drawer, Form, InputNumber, Space, Table, message } from 'antd';
import React from 'react';
import PageBox from '../_components/page-box';

const Rollouts: React.FC = () => {
  const intl = useIntl();
  const [rows, setRows] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    const data = await request('/canary-rollouts', {
      params: { page: 1, perPage: 50 }
    });
    setRows(data.items || []);
  };

  React.useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const create = async () => {
    const values = await form.validateFields();
    await request('/canary-rollouts', {
      method: 'POST',
      data: {
        model_route_id: values.model_route_id,
        from_target_id: values.from_target_id,
        to_target_id: values.to_target_id,
        stages: [{ percent: values.percent, hold_seconds: values.hold_seconds }]
      }
    });
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    setOpen(false);
    form.resetFields();
    load();
  };

  const act = async (id: number, action: string) => {
    await request(`/canary-rollouts/${id}/${action}`, { method: 'POST' });
    load();
  };

  return (
    <PageBox>
      <Space style={{ margin: '24px 0 16px' }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          {intl.formatMessage({ id: 'rollouts.add' })}
        </Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={rows}
        columns={[
          {
            title: intl.formatMessage({ id: 'rollouts.route' }),
            dataIndex: 'model_route_id'
          },
          {
            title: intl.formatMessage({ id: 'rollouts.from' }),
            dataIndex: 'from_target_id'
          },
          {
            title: intl.formatMessage({ id: 'rollouts.to' }),
            dataIndex: 'to_target_id'
          },
          {
            title: intl.formatMessage({ id: 'rollouts.status' }),
            dataIndex: 'status'
          },
          {
            title: intl.formatMessage({ id: 'rollouts.stage' }),
            dataIndex: 'current_stage'
          },
          {
            title: intl.formatMessage({ id: 'common.table.operation' }),
            render: (_: any, row: any) => (
              <Space>
                {row.status === 'running' ? (
                  <a onClick={() => act(row.id, 'pause')}>
                    {intl.formatMessage({ id: 'rollouts.pause' })}
                  </a>
                ) : null}
                {row.status === 'paused' ? (
                  <a onClick={() => act(row.id, 'resume')}>
                    {intl.formatMessage({ id: 'rollouts.resume' })}
                  </a>
                ) : null}
                {row.status === 'running' ||
                row.status === 'paused' ||
                row.status === 'pending' ? (
                  <a onClick={() => act(row.id, 'abort')}>
                    {intl.formatMessage({ id: 'rollouts.abort' })}
                  </a>
                ) : null}
              </Space>
            )
          }
        ]}
      />
      <Drawer
        open={open}
        width={480}
        onClose={() => setOpen(false)}
        title={intl.formatMessage({ id: 'rollouts.add' })}
        extra={
          <Button type="primary" onClick={create}>
            {intl.formatMessage({ id: 'common.button.save' })}
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ percent: 10, hold_seconds: 300 }}
        >
          <Form.Item
            name="model_route_id"
            label={intl.formatMessage({ id: 'rollouts.route' })}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="from_target_id"
            label={intl.formatMessage({ id: 'rollouts.from' })}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="to_target_id"
            label={intl.formatMessage({ id: 'rollouts.to' })}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="percent"
            label={intl.formatMessage({ id: 'rollouts.percent' })}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="hold_seconds"
            label={intl.formatMessage({ id: 'rollouts.hold' })}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </PageBox>
  );
};

export default Rollouts;
