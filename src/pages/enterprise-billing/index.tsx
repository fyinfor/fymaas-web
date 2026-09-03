import { request, useIntl } from '@umijs/max';
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Tabs,
  message
} from 'antd';
import React from 'react';
import PageBox from '../_components/page-box';

const EnterpriseBilling: React.FC = () => {
  const intl = useIntl();
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [plans, setPlans] = React.useState<any[]>([]);
  const [centers, setCenters] = React.useState<any[]>([]);
  const [detail, setDetail] = React.useState<any>(null);
  const [planForm] = Form.useForm();
  const [centerForm] = Form.useForm();

  const load = async () => {
    const [inv, pl, cc] = await Promise.all([
      request('/billing/invoices', {
        method: 'GET',
        params: { page: 1, perPage: 50 }
      }),
      request('/billing/price-plans', {
        method: 'GET',
        params: { page: 1, perPage: 50 }
      }),
      request('/billing/cost-centers', {
        method: 'GET',
        params: { page: 1, perPage: 50 }
      })
    ]);
    setInvoices(inv.items || []);
    setPlans(pl.items || []);
    setCenters(cc.items || []);
  };

  React.useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const createPlan = async () => {
    const values = await planForm.validateFields();
    await request('/billing/price-plans', { method: 'POST', data: values });
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    planForm.resetFields();
    load();
  };

  const createCenter = async () => {
    const values = await centerForm.validateFields();
    await request('/billing/cost-centers', { method: 'POST', data: values });
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    centerForm.resetFields();
    load();
  };

  return (
    <PageBox>
      <Tabs
        items={[
          {
            key: 'invoices',
            label: intl.formatMessage({ id: 'billing.tab.invoices' }),
            children: (
              <Table
                rowKey="id"
                dataSource={invoices}
                columns={[
                  {
                    title: intl.formatMessage({ id: 'billing.invoice.org' }),
                    dataIndex: 'org_name'
                  },
                  {
                    title: intl.formatMessage({ id: 'billing.invoice.period' }),
                    dataIndex: 'period_start'
                  },
                  {
                    title: intl.formatMessage({ id: 'billing.invoice.amount' }),
                    dataIndex: 'total_amount'
                  },
                  {
                    title: intl.formatMessage({ id: 'billing.invoice.status' }),
                    dataIndex: 'status'
                  },
                  {
                    title: intl.formatMessage({ id: 'common.table.operation' }),
                    render: (_: any, row: any) => (
                      <a
                        onClick={async () => {
                          setDetail(
                            await request(`/billing/invoices/${row.id}`)
                          );
                        }}
                      >
                        {intl.formatMessage({ id: 'common.button.view' })}
                      </a>
                    )
                  }
                ]}
              />
            )
          },
          {
            key: 'plans',
            label: intl.formatMessage({ id: 'billing.tab.plans' }),
            children: (
              <>
                <Form
                  form={planForm}
                  layout="inline"
                  style={{ marginBottom: 16 }}
                >
                  <Form.Item name="name" rules={[{ required: true }]}>
                    <Input
                      placeholder={intl.formatMessage({
                        id: 'common.table.name'
                      })}
                    />
                  </Form.Item>
                  <Form.Item name="currency" initialValue="USD">
                    <Select
                      style={{ width: 100 }}
                      options={[{ value: 'USD' }, { value: 'CNY' }]}
                    />
                  </Form.Item>
                  <Button type="primary" onClick={createPlan}>
                    {intl.formatMessage({ id: 'billing.plan.add' })}
                  </Button>
                </Form>
                <Table
                  rowKey="id"
                  dataSource={plans}
                  columns={[
                    {
                      title: intl.formatMessage({ id: 'common.table.name' }),
                      dataIndex: 'name'
                    },
                    {
                      title: intl.formatMessage({
                        id: 'billing.plan.currency'
                      }),
                      dataIndex: 'currency'
                    },
                    {
                      title: intl.formatMessage({ id: 'billing.plan.enabled' }),
                      dataIndex: 'enabled',
                      render: (v) => String(v)
                    }
                  ]}
                />
              </>
            )
          },
          {
            key: 'centers',
            label: intl.formatMessage({ id: 'billing.tab.centers' }),
            children: (
              <>
                <Form
                  form={centerForm}
                  layout="inline"
                  style={{ marginBottom: 16 }}
                >
                  <Form.Item name="name" rules={[{ required: true }]}>
                    <Input
                      placeholder={intl.formatMessage({
                        id: 'common.table.name'
                      })}
                    />
                  </Form.Item>
                  <Form.Item name="org_principal_id">
                    <InputNumber
                      placeholder={intl.formatMessage({
                        id: 'billing.center.orgId'
                      })}
                    />
                  </Form.Item>
                  <Button type="primary" onClick={createCenter}>
                    {intl.formatMessage({ id: 'billing.center.add' })}
                  </Button>
                </Form>
                <Table
                  rowKey="id"
                  dataSource={centers}
                  columns={[
                    {
                      title: intl.formatMessage({ id: 'common.table.name' }),
                      dataIndex: 'name'
                    },
                    {
                      title: intl.formatMessage({ id: 'billing.center.orgId' }),
                      dataIndex: 'org_principal_id'
                    }
                  ]}
                />
              </>
            )
          }
        ]}
      />
      <Drawer
        open={!!detail}
        width={640}
        onClose={() => setDetail(null)}
        title={intl.formatMessage({ id: 'billing.invoice.detail' })}
      >
        {detail && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item
                label={intl.formatMessage({ id: 'billing.invoice.org' })}
              >
                {detail.org_name}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({ id: 'billing.invoice.amount' })}
              >
                {detail.total_amount} {detail.currency}
              </Descriptions.Item>
            </Descriptions>
            <Table
              style={{ marginTop: 16 }}
              rowKey="id"
              dataSource={detail.items || []}
              pagination={false}
              columns={[
                {
                  title: intl.formatMessage({ id: 'billing.item.description' }),
                  dataIndex: 'description'
                },
                {
                  title: intl.formatMessage({ id: 'billing.item.quantity' }),
                  dataIndex: 'quantity'
                },
                {
                  title: intl.formatMessage({ id: 'billing.item.amount' }),
                  dataIndex: 'amount'
                }
              ]}
            />
          </>
        )}
      </Drawer>
    </PageBox>
  );
};

export default EnterpriseBilling;
