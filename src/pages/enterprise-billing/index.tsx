import { queryBillingSettings } from '@/enterprise/system-settings/apis';
import { loadEnterprisePeople, type PersonOption } from '@/enterprise/people';
import { downloadFile } from '@/utils/download-stream';
import { request, useAccess, useIntl } from '@umijs/max';
import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import PageBox from '../_components/page-box';

const lastMonth = () => {
  const start = dayjs().startOf('month').subtract(1, 'month');
  return [start, start.add(1, 'month')] as [dayjs.Dayjs, dayjs.Dayjs];
};

const EnterpriseBilling: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [plans, setPlans] = React.useState<any[]>([]);
  const [centers, setCenters] = React.useState<any[]>([]);
  const [detail, setDetail] = React.useState<any>(null);
  const [planItems, setPlanItems] = React.useState<any[]>([]);
  const [activePlan, setActivePlan] = React.useState<any>(null);
  const [itemsOpen, setItemsOpen] = React.useState(false);
  const [bindings, setBindings] = React.useState<any[]>([]);
  const [activeCenter, setActiveCenter] = React.useState<any>(null);
  const [people, setPeople] = React.useState<PersonOption[]>([]);
  const [orgs, setOrgs] = React.useState<{ id: number; name: string }[]>([]);
  const [generating, setGenerating] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>();
  const [baseCurrency, setBaseCurrency] = React.useState('CNY');
  const [planForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [centerForm] = Form.useForm();
  const [bindForm] = Form.useForm();
  const [genForm] = Form.useForm();

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
    loadEnterprisePeople()
      .then(setPeople)
      .catch(() => undefined);
    request('/organization-directory', {
      params: { page: 1, perPage: 100 }
    })
      .then((page) =>
        setOrgs(
          (page.items || []).map((item: any) => ({
            id: item.id,
            name: item.display_name || item.name
          }))
        )
      )
      .catch(() => undefined);
    queryBillingSettings()
      .then((data) => {
        const currency = data.base_currency || 'CNY';
        setBaseCurrency(currency);
        if (!planForm.getFieldValue('currency')) {
          planForm.setFieldValue('currency', currency);
        }
      })
      .catch(() => undefined);
  }, []);

  const statusColor = (status: string) => {
    if (status === 'issued') return 'success';
    if (status === 'void') return 'default';
    return 'processing';
  };

  const formatPeriod = (row: any) => {
    const start = row.period_start
      ? dayjs(row.period_start).format('YYYY-MM-DD')
      : '';
    const end = row.period_end
      ? dayjs(row.period_end).format('YYYY-MM-DD')
      : '';
    return start && end ? `${start} → ${end}` : start || end || '—';
  };

  const formatAmount = (row: any) => {
    const amount = Number(row.total_amount);
    const text = Number.isFinite(amount) ? amount.toFixed(4) : row.total_amount;
    return `${text} ${row.currency || ''}`.trim();
  };

  const orgLabel = (id?: number) => {
    if (!id) {
      return intl.formatMessage({ id: 'billing.center.platformDefault' });
    }
    return orgs.find((item) => item.id === id)?.name || String(id);
  };

  const generate = async () => {
    const values = await genForm.validateFields();
    setGenerating(true);
    try {
      const range = values.period || lastMonth();
      await request('/billing/invoices/generate', {
        method: 'POST',
        data: {
          org_principal_id: values.org_principal_id,
          period_start: range[0].toISOString(),
          period_end: range[1].toISOString()
        }
      });
      message.success(intl.formatMessage({ id: 'common.message.success' }));
      load();
    } finally {
      setGenerating(false);
    }
  };

  const actInvoice = async (id: number, action: 'issue' | 'void') => {
    Modal.confirm({
      title: intl.formatMessage({
        id:
          action === 'issue'
            ? 'billing.invoice.issueConfirm'
            : 'billing.invoice.voidConfirm'
      }),
      okText: intl.formatMessage({ id: 'common.button.confirm' }),
      cancelText: intl.formatMessage({ id: 'common.button.cancel' }),
      onOk: async () => {
        await request(`/billing/invoices/${id}/${action}`, {
          method: 'POST'
        });
        message.success(intl.formatMessage({ id: 'common.message.success' }));
        if (detail?.id === id) {
          setDetail(await request(`/billing/invoices/${id}`));
        }
        load();
      }
    });
  };

  const exportInvoice = async (id: number) => {
    const res = await request(`/billing/invoices/${id}/export`, {
      method: 'GET',
      responseType: 'blob',
      getResponse: true
    });
    const blob = res?.data instanceof Blob ? res.data : res;
    downloadFile(blob, `invoice-${id}.csv`);
  };

  const createPlan = async () => {
    const values = await planForm.validateFields();
    if (activePlan) {
      await request(`/billing/price-plans/${activePlan.id}`, {
        method: 'PUT',
        data: values
      });
    } else {
      await request('/billing/price-plans', { method: 'POST', data: values });
    }
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    planForm.resetFields();
    planForm.setFieldValue('currency', baseCurrency);
    setActivePlan(null);
    load();
  };

  const openPlanItems = async (plan: any) => {
    setActivePlan(plan);
    setItemsOpen(true);
    const items = await request(`/billing/price-plans/${plan.id}/items`);
    setPlanItems(Array.isArray(items) ? items : []);
  };

  const addItem = async () => {
    if (!activePlan) return;
    const values = await itemForm.validateFields();
    await request(`/billing/price-plans/${activePlan.id}/items`, {
      method: 'POST',
      data: values
    });
    itemForm.resetFields();
    openPlanItems(activePlan);
  };

  const createCenter = async () => {
    const values = await centerForm.validateFields();
    await request('/billing/cost-centers', { method: 'POST', data: values });
    message.success(intl.formatMessage({ id: 'common.message.success' }));
    centerForm.resetFields();
    load();
  };

  const openBindings = async (center: any) => {
    setActiveCenter(center);
    const rows = await request(`/billing/cost-centers/${center.id}/bindings`);
    setBindings(Array.isArray(rows) ? rows : []);
  };

  const addBinding = async () => {
    if (!activeCenter) return;
    const values = await bindForm.validateFields();
    await request(`/billing/cost-centers/${activeCenter.id}/bindings`, {
      method: 'POST',
      data: { principal_id: Number(values.principal_id) }
    });
    bindForm.resetFields();
    openBindings(activeCenter);
  };

  return (
    <PageBox>
      <Tabs
        items={[
          {
            key: 'invoices',
            label: intl.formatMessage({ id: 'billing.tab.invoices' }),
            children: (
              <>
                <Form
                  form={genForm}
                  layout="inline"
                  style={{ margin: '8px 0 16px' }}
                  initialValues={{ period: lastMonth() }}
                >
                  {access.canSeeAdmin ? (
                    <Form.Item
                      name="org_principal_id"
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({
                            id: 'billing.invoice.selectOrg'
                          })
                        }
                      ]}
                    >
                      <Select
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        style={{ minWidth: 200 }}
                        placeholder={intl.formatMessage({
                          id: 'billing.invoice.org'
                        })}
                        options={orgs.map((item) => ({
                          label: item.name,
                          value: item.id
                        }))}
                      />
                    </Form.Item>
                  ) : null}
                  <Form.Item
                    name="period"
                    label={intl.formatMessage({
                      id: 'billing.invoice.periodRange'
                    })}
                  >
                    <DatePicker.RangePicker format="YYYY-MM-DD" />
                  </Form.Item>
                  <Form.Item>
                    <Select
                      allowClear
                      style={{ minWidth: 140 }}
                      placeholder={intl.formatMessage({
                        id: 'billing.invoice.status'
                      })}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={['draft', 'issued', 'void'].map((status) => ({
                        value: status,
                        label: intl.formatMessage({
                          id: `billing.status.${status}`
                        })
                      }))}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    loading={generating}
                    onClick={generate}
                  >
                    {intl.formatMessage({ id: 'billing.invoice.generate' })}
                  </Button>
                </Form>
                <Table
                  rowKey="id"
                  dataSource={
                    statusFilter
                      ? invoices.filter((row) => row.status === statusFilter)
                      : invoices
                  }
                  locale={{
                    emptyText: (
                      <Empty
                        description={intl.formatMessage({
                          id: 'billing.invoice.empty'
                        })}
                      />
                    )
                  }}
                  columns={[
                    {
                      title: intl.formatMessage({ id: 'billing.invoice.org' }),
                      dataIndex: 'org_name'
                    },
                    {
                      title: intl.formatMessage({
                        id: 'billing.invoice.periodRange'
                      }),
                      render: (_: any, row: any) => formatPeriod(row)
                    },
                    {
                      title: intl.formatMessage({
                        id: 'billing.invoice.amount'
                      }),
                      render: (_: any, row: any) => formatAmount(row)
                    },
                    {
                      title: intl.formatMessage({
                        id: 'billing.invoice.status'
                      }),
                      dataIndex: 'status',
                      render: (status: string) => (
                        <Tag color={statusColor(status)}>
                          {intl.formatMessage({
                            id: `billing.status.${status}`,
                            defaultMessage: status
                          })}
                        </Tag>
                      )
                    },
                    {
                      title: intl.formatMessage({
                        id: 'common.table.operation'
                      }),
                      render: (_: any, row: any) => (
                        <Space>
                          <a
                            onClick={async () => {
                              setDetail(
                                await request(`/billing/invoices/${row.id}`)
                              );
                            }}
                          >
                            {intl.formatMessage({ id: 'common.button.view' })}
                          </a>
                          {row.status === 'draft' ? (
                            <a onClick={() => actInvoice(row.id, 'issue')}>
                              {intl.formatMessage({
                                id: 'billing.invoice.issue'
                              })}
                            </a>
                          ) : null}
                          {row.status !== 'void' ? (
                            <a onClick={() => actInvoice(row.id, 'void')}>
                              {intl.formatMessage({
                                id: 'billing.invoice.void'
                              })}
                            </a>
                          ) : null}
                          <a onClick={() => exportInvoice(row.id)}>
                            {intl.formatMessage({
                              id: 'billing.invoice.export'
                            })}
                          </a>
                        </Space>
                      )
                    }
                  ]}
                />
              </>
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
                  <Form.Item name="currency" initialValue={baseCurrency}>
                    <Select
                      style={{ width: 100 }}
                      options={[{ value: 'USD' }, { value: 'CNY' }]}
                    />
                  </Form.Item>
                  <Button type="primary" onClick={createPlan}>
                    {intl.formatMessage({
                      id: activePlan ? 'billing.plan.edit' : 'billing.plan.add'
                    })}
                  </Button>
                  {activePlan ? (
                    <Button
                      onClick={() => {
                        setActivePlan(null);
                        planForm.resetFields();
                      }}
                    >
                      {intl.formatMessage({ id: 'common.button.cancel' })}
                    </Button>
                  ) : null}
                </Form>
                <Table
                  rowKey="id"
                  dataSource={plans}
                  locale={{
                    emptyText: (
                      <Empty
                        description={intl.formatMessage({
                          id: 'billing.plan.empty'
                        })}
                      />
                    )
                  }}
                  columns={[
                    {
                      title: intl.formatMessage({ id: 'common.table.name' }),
                      dataIndex: 'name',
                      render: (name: string, row: any) => (
                        <Space>
                          <span>{name}</span>
                          {row.name === 'platform-default' ||
                          row.org_principal_id === 0 ? (
                            <Tag>
                              {intl.formatMessage({
                                id: 'billing.center.platformDefault'
                              })}
                            </Tag>
                          ) : null}
                        </Space>
                      )
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
                      render: (v: boolean) => (
                        <Tag color={v ? 'success' : 'default'}>
                          {v
                            ? intl.formatMessage({ id: 'common.button.enable' })
                            : intl.formatMessage({
                                id: 'common.button.disable'
                              })}
                        </Tag>
                      )
                    },
                    {
                      title: intl.formatMessage({
                        id: 'common.table.operation'
                      }),
                      render: (_: any, row: any) => (
                        <Space>
                          <a
                            onClick={() => {
                              setActivePlan(row);
                              planForm.setFieldsValue(row);
                            }}
                          >
                            {intl.formatMessage({ id: 'common.button.edit' })}
                          </a>
                          <a onClick={() => openPlanItems(row)}>
                            {intl.formatMessage({ id: 'billing.plan.items' })}
                          </a>
                          <a
                            onClick={async () => {
                              await request(`/billing/price-plans/${row.id}`, {
                                method: 'DELETE'
                              });
                              load();
                            }}
                          >
                            {intl.formatMessage({
                              id: 'common.button.delete'
                            })}
                          </a>
                        </Space>
                      )
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
                  <Button type="primary" onClick={createCenter}>
                    {intl.formatMessage({ id: 'billing.center.add' })}
                  </Button>
                </Form>
                <Table
                  rowKey="id"
                  dataSource={centers}
                  locale={{
                    emptyText: (
                      <Empty
                        description={intl.formatMessage({
                          id: 'billing.center.empty'
                        })}
                      />
                    )
                  }}
                  columns={[
                    {
                      title: intl.formatMessage({ id: 'common.table.name' }),
                      dataIndex: 'name'
                    },
                    {
                      title: intl.formatMessage({ id: 'billing.invoice.org' }),
                      dataIndex: 'org_principal_id',
                      render: (id: number) => orgLabel(id)
                    },
                    {
                      title: intl.formatMessage({
                        id: 'common.table.operation'
                      }),
                      render: (_: any, row: any) => (
                        <Space>
                          <a onClick={() => openBindings(row)}>
                            {intl.formatMessage({
                              id: 'billing.center.bindings'
                            })}
                          </a>
                          <a
                            onClick={async () => {
                              await request(`/billing/cost-centers/${row.id}`, {
                                method: 'DELETE'
                              });
                              load();
                            }}
                          >
                            {intl.formatMessage({
                              id: 'common.button.delete'
                            })}
                          </a>
                        </Space>
                      )
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
            <Space style={{ marginBottom: 16 }}>
              {detail.status === 'draft' ? (
                <Button
                  type="primary"
                  onClick={() => actInvoice(detail.id, 'issue')}
                >
                  {intl.formatMessage({ id: 'billing.invoice.issue' })}
                </Button>
              ) : null}
              {detail.status !== 'void' ? (
                <Button onClick={() => actInvoice(detail.id, 'void')}>
                  {intl.formatMessage({ id: 'billing.invoice.void' })}
                </Button>
              ) : null}
              <Button onClick={() => exportInvoice(detail.id)}>
                {intl.formatMessage({ id: 'billing.invoice.export' })}
              </Button>
            </Space>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item
                label={intl.formatMessage({ id: 'billing.invoice.org' })}
              >
                {detail.org_name}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'billing.invoice.periodRange'
                })}
              >
                {formatPeriod(detail)}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({ id: 'billing.invoice.amount' })}
              >
                {formatAmount(detail)}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({ id: 'billing.invoice.status' })}
              >
                <Tag color={statusColor(detail.status)}>
                  {intl.formatMessage({
                    id: `billing.status.${detail.status}`,
                    defaultMessage: detail.status
                  })}
                </Tag>
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
                  render: (_: any, row: any) => {
                    const amount = Number(row.amount);
                    return Number.isFinite(amount)
                      ? amount.toFixed(4)
                      : row.amount;
                  }
                }
              ]}
            />
          </>
        )}
      </Drawer>
      <Drawer
        open={itemsOpen}
        width={640}
        onClose={() => {
          setItemsOpen(false);
          setPlanItems([]);
        }}
        title={intl.formatMessage({ id: 'billing.plan.items' })}
      >
        <Form form={itemForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="item_type" initialValue="token">
            <Select
              style={{ width: 120 }}
              options={[
                { value: 'token', label: 'TOKEN' },
                { value: 'gpu_time', label: 'GPU' },
                { value: 'storage', label: 'STORAGE' }
              ]}
            />
          </Form.Item>
          <Form.Item name="match_key" initialValue="*">
            <Input
              placeholder={intl.formatMessage({ id: 'billing.item.match' })}
              style={{ width: 140 }}
            />
          </Form.Item>
          <Form.Item name="token_kind">
            <Select
              allowClear
              style={{ width: 130 }}
              placeholder={intl.formatMessage({ id: 'billing.item.kind' })}
              options={[
                { value: 'input' },
                { value: 'output' },
                { value: 'cached_input' }
              ]}
            />
          </Form.Item>
          <Form.Item name="unit_price" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              placeholder={intl.formatMessage({ id: 'billing.item.price' })}
            />
          </Form.Item>
          <Button type="primary" onClick={addItem}>
            {intl.formatMessage({ id: 'billing.item.add' })}
          </Button>
        </Form>
        <Table
          rowKey="id"
          dataSource={planItems}
          pagination={false}
          columns={[
            {
              title: intl.formatMessage({ id: 'billing.item.type' }),
              dataIndex: 'item_type'
            },
            {
              title: intl.formatMessage({ id: 'billing.item.match' }),
              dataIndex: 'match_key'
            },
            {
              title: intl.formatMessage({ id: 'billing.item.kind' }),
              dataIndex: 'token_kind'
            },
            {
              title: intl.formatMessage({ id: 'billing.item.price' }),
              dataIndex: 'unit_price'
            },
            {
              title: intl.formatMessage({ id: 'common.table.operation' }),
              render: (_: any, row: any) =>
                activePlan ? (
                  <a
                    onClick={async () => {
                      await request(
                        `/billing/price-plans/${activePlan.id}/items/${row.id}`,
                        { method: 'DELETE' }
                      );
                      openPlanItems(activePlan);
                    }}
                  >
                    {intl.formatMessage({ id: 'common.button.delete' })}
                  </a>
                ) : null
            }
          ]}
        />
      </Drawer>
      <Drawer
        open={!!activeCenter}
        width={520}
        onClose={() => setActiveCenter(null)}
        title={intl.formatMessage({ id: 'billing.center.bindings' })}
      >
        <Form form={bindForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="principal_id" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              style={{ minWidth: 220 }}
              placeholder={intl.formatMessage({
                id: 'billing.center.principal'
              })}
              options={people.map((item) => ({
                label: item.name,
                value: item.id
              }))}
            />
          </Form.Item>
          <Button type="primary" onClick={addBinding}>
            {intl.formatMessage({ id: 'billing.center.bind' })}
          </Button>
        </Form>
        <Table
          rowKey="id"
          dataSource={bindings}
          pagination={false}
          columns={[
            {
              title: intl.formatMessage({ id: 'billing.center.principal' }),
              dataIndex: 'principal_name'
            },
            {
              title: intl.formatMessage({ id: 'common.table.operation' }),
              render: (_: any, row: any) =>
                activeCenter ? (
                  <a
                    onClick={async () => {
                      await request(
                        `/billing/cost-centers/${activeCenter.id}/bindings/${row.id}`,
                        { method: 'DELETE' }
                      );
                      openBindings(activeCenter);
                    }}
                  >
                    {intl.formatMessage({ id: 'common.button.delete' })}
                  </a>
                ) : null
            }
          ]}
        />
      </Drawer>
    </PageBox>
  );
};

export default EnterpriseBilling;
