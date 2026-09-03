import { queryModelRoutes, queryRouteTargets } from '@/pages/model-routes/apis';
import { request, useIntl } from '@umijs/max';
import {
  Button,
  Drawer,
  Empty,
  Form,
  InputNumber,
  Select,
  Space,
  Table,
  message
} from 'antd';
import React from 'react';
import PageBox from '../_components/page-box';

const Rollouts: React.FC = () => {
  const intl = useIntl();
  const [rows, setRows] = React.useState<any[]>([]);
  const [routes, setRoutes] = React.useState<any[]>([]);
  const [targets, setTargets] = React.useState<any[]>([]);
  const [formTargets, setFormTargets] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();
  const routeId = Form.useWatch('model_route_id', form);

  const load = async () => {
    const [data, routePage] = await Promise.all([
      request('/canary-rollouts', { params: { page: 1, perPage: 50 } }),
      queryModelRoutes({ page: 1, perPage: 100 })
    ]);
    const items = data.items || [];
    setRows(items);
    setRoutes(routePage.items || []);
    const routeIds = [
      ...new Set(items.map((row: any) => row.model_route_id).filter(Boolean))
    ];
    const pages = await Promise.all(
      routeIds.map((id) => queryRouteTargets({ id: Number(id) }))
    );
    setTargets(pages.flatMap((page) => page.items || []));
  };

  React.useEffect(() => {
    load().catch(() => undefined);
  }, []);

  React.useEffect(() => {
    if (!routeId) {
      setFormTargets([]);
      return;
    }
    queryRouteTargets({ id: routeId })
      .then((page) => setFormTargets(page.items || []))
      .catch(() => setFormTargets([]));
  }, [routeId]);

  const routeName = (id: number) =>
    routes.find((item) => item.id === id)?.name || id;
  const targetName = (id: number) => {
    const target = [...targets, ...formTargets].find((item) => item.id === id);
    if (target) {
      return target.overridden_model_name || target.name || id;
    }
    return id;
  };

  const create = async () => {
    const values = await form.validateFields();
    await request('/canary-rollouts', {
      method: 'POST',
      data: {
        model_route_id: values.model_route_id,
        from_target_id: values.from_target_id,
        to_target_id: values.to_target_id,
        stages: (values.stages || []).map((stage: any) => ({
          percent: stage.percent,
          hold_seconds: stage.hold_seconds
        }))
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
        locale={{
          emptyText: (
            <Empty description={intl.formatMessage({ id: 'rollouts.empty' })} />
          )
        }}
        columns={[
          {
            title: intl.formatMessage({ id: 'rollouts.route' }),
            dataIndex: 'model_route_id',
            render: (id: number) => routeName(id)
          },
          {
            title: intl.formatMessage({ id: 'rollouts.from' }),
            dataIndex: 'from_target_id',
            render: (id: number) => targetName(id)
          },
          {
            title: intl.formatMessage({ id: 'rollouts.to' }),
            dataIndex: 'to_target_id',
            render: (id: number) => targetName(id)
          },
          {
            title: intl.formatMessage({ id: 'rollouts.status' }),
            dataIndex: 'status'
          },
          {
            title: intl.formatMessage({ id: 'rollouts.stage' }),
            render: (_: any, row: any) =>
              `${row.current_stage + 1}/${(row.stages || []).length || 1}`
          },
          {
            title: intl.formatMessage({ id: 'rollouts.error' }),
            dataIndex: 'last_error',
            render: (v: string) => v || '—'
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
          initialValues={{
            stages: [{ percent: 10, hold_seconds: 300 }]
          }}
        >
          <Form.Item
            name="model_route_id"
            label={intl.formatMessage({ id: 'rollouts.route' })}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={routes.map((item) => ({
                label: item.name,
                value: item.id
              }))}
            />
          </Form.Item>
          <Form.Item
            name="from_target_id"
            label={intl.formatMessage({ id: 'rollouts.from' })}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={formTargets.map((item) => ({
                label: item.overridden_model_name || item.name,
                value: item.id
              }))}
            />
          </Form.Item>
          <Form.Item
            name="to_target_id"
            label={intl.formatMessage({ id: 'rollouts.to' })}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={formTargets.map((item) => ({
                label: item.overridden_model_name || item.name,
                value: item.id
              }))}
            />
          </Form.Item>
          <Form.List name="stages">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Space
                    key={field.key}
                    align="baseline"
                    style={{ display: 'flex', marginBottom: 8 }}
                  >
                    <Form.Item
                      name={[field.name, 'percent']}
                      label={
                        index === 0
                          ? intl.formatMessage({ id: 'rollouts.percent' })
                          : undefined
                      }
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} max={100} />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'hold_seconds']}
                      label={
                        index === 0
                          ? intl.formatMessage({ id: 'rollouts.hold' })
                          : undefined
                      }
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <a onClick={() => remove(field.name)}>
                        {intl.formatMessage({ id: 'common.button.delete' })}
                      </a>
                    ) : null}
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ percent: 50, hold_seconds: 300 })}
                  block
                >
                  {intl.formatMessage({ id: 'rollouts.stageAdd' })}
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>
    </PageBox>
  );
};

export default Rollouts;
