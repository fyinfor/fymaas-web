import { ListEmpty, TableLoadGate } from '@/components/console';
import { TABLE_SORT_DIRECTIONS } from '@/config/settings';
import useTableFetch from '@/hooks/use-table-fetch';
import { IconFont, SimpleCard, SimpleSelect } from '@gpustack/core-ui';
import { useAccess, useIntl } from '@umijs/max';
import { useMemoizedFn, useRequest } from 'ahooks';
import { Button, ConfigProvider, DatePicker, Input, Space, Table } from 'antd';
import type { Dayjs } from 'dayjs';
import _ from 'lodash';
import React from 'react';
import PageBox from '../../_components/page-box';
import {
  queryRequestLogMeta,
  queryRequestLogs,
  queryRequestLogStat
} from '../apis';
import { ListItem, LogFilters, LogKind } from '../config/types';
import useLogColumns from '../hooks/use-log-columns';
import useExportLogs from '../services/use-export-logs';
import DetailDrawer from './detail-drawer';

const { RangePicker } = DatePicker;

interface LogPageProps {
  kind: LogKind;
}

const LogPage: React.FC<LogPageProps> = ({ kind }) => {
  const intl = useIntl();
  const access = useAccess();
  const showUser = !!access.canSeeOrgAdmin;
  const scope = showUser ? 'all' : 'self';

  const {
    dataSource,
    queryParams,
    sortOrder,
    fetchData,
    handlePageChange,
    handleTableChange,
    handleQueryChange,
    handleNameChange
  } = useTableFetch<ListItem>({
    fetchAPI: (params) => queryRequestLogs(kind, { ...params, scope }),
    watch: false,
    polling: false,
    defaultQueryParams: { scope }
  });

  const currentFilters = (): LogFilters =>
    _.pickBy(
      _.pick(queryParams, [
        'search',
        'operation',
        'status',
        'model_name',
        'user_name',
        'api_key_name',
        'start_time',
        'end_time',
        'scope'
      ]),
      (value: any) => value !== undefined && value !== ''
    ) as LogFilters;

  const { data: stat } = useRequest(
    () => queryRequestLogStat(kind, currentFilters()),
    {
      refreshDeps: [
        kind,
        queryParams.search,
        queryParams.operation,
        queryParams.status,
        queryParams.model_name,
        queryParams.user_name,
        queryParams.api_key_name,
        queryParams.start_time,
        queryParams.end_time
      ]
    }
  );

  const { data: meta } = useRequest(
    () => queryRequestLogMeta(kind, { scope }),
    {
      onError: () => undefined
    }
  );

  const { exporting, exportData } = useExportLogs(kind);

  const [detail, setDetail] = React.useState<{
    open: boolean;
    data?: ListItem | null;
  }>({ open: false, data: null });

  const handleView = useMemoizedFn((record: ListItem) => {
    setDetail({ open: true, data: record });
  });

  const handleRangeChange = (dates: null | (Dayjs | null)[]) => {
    const [start, end] = dates || [];
    handleQueryChange({
      page: 1,
      start_time: start ? start.toISOString() : undefined,
      end_time: end ? end.toISOString() : undefined
    });
  };

  const operationOptions = React.useMemo(
    () =>
      (meta?.operations || []).map((value) => ({
        label: intl.formatMessage({
          id: `requestLogs.operation.${value}`,
          defaultMessage: value
        }),
        value
      })),
    [intl, meta]
  );

  const statusOptions = React.useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'requestLogs.status.completed' }),
        value: 'completed'
      },
      {
        label: intl.formatMessage({ id: 'requestLogs.status.interrupted' }),
        value: 'interrupted'
      }
    ],
    [intl]
  );

  const modelOptions = React.useMemo(
    () => (meta?.models || []).map((value) => ({ label: value, value })),
    [meta]
  );
  const columns = useLogColumns({
    kind,
    showUser,
    onView: handleView,
    sortOrder
  });

  const renderEmpty = (type?: string) => {
    if (type !== 'Table') return;
    return (
      <ListEmpty
        icon={<IconFont type="icon-logs" />}
        title={intl.formatMessage({
          id:
            kind === 'task'
              ? 'requestLogs.noresult.taskTitle'
              : 'requestLogs.noresult.title'
        })}
        description={intl.formatMessage({
          id:
            kind === 'task'
              ? 'requestLogs.noresult.taskSubTitle'
              : 'requestLogs.noresult.subTitle'
        })}
        noFound={intl.formatMessage({ id: 'requestLogs.noresult.nofound' })}
        queryParams={{
          search: queryParams.search,
          operation: queryParams.operation,
          status: queryParams.status
        }}
      />
    );
  };

  const summaryCards = [
    {
      label: intl.formatMessage({ id: 'requestLogs.stat.total' }),
      value: stat?.total ?? 0,
      color: 'var(--ant-color-text)'
    },
    {
      label: intl.formatMessage({ id: 'requestLogs.stat.completed' }),
      value: stat?.completed ?? 0,
      color: 'var(--ant-color-success)'
    },
    {
      label: intl.formatMessage({ id: 'requestLogs.stat.interrupted' }),
      value: stat?.interrupted ?? 0,
      color: 'var(--ant-color-warning)'
    },
    {
      label: intl.formatMessage({
        id:
          kind === 'task'
            ? 'requestLogs.stat.avgLatency'
            : 'requestLogs.stat.tokens'
      }),
      value:
        kind === 'task'
          ? stat?.avg_latency_ms != null
            ? Math.round(stat.avg_latency_ms)
            : '-'
          : (stat?.total_tokens ?? 0),
      color: 'var(--ant-color-text)'
    }
  ];

  return (
    <>
      <PageBox>
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <SimpleCard
            dataList={summaryCards}
            height={80}
            styles={{
              item: {
                backgroundColor: 'var(--ant-color-fill-quaternary)',
                borderRadius: '6px'
              }
            }}
          />
        </div>
        <Space wrap style={{ marginTop: 22, marginBottom: 22 }}>
          <Input.Search
            allowClear
            style={{ width: 240 }}
            placeholder={intl.formatMessage({
              id: 'requestLogs.filter.search'
            })}
            onChange={handleNameChange}
            onSearch={() => fetchData()}
          />
          <SimpleSelect
            allowClear
            showSearch
            style={{ width: 180 }}
            placeholder={intl.formatMessage({
              id: 'requestLogs.filter.operation'
            })}
            options={operationOptions}
            onChange={(value: string) =>
              handleQueryChange({ page: 1, operation: value || undefined })
            }
          />
          <SimpleSelect
            allowClear
            style={{ width: 150 }}
            placeholder={intl.formatMessage({
              id: 'requestLogs.filter.status'
            })}
            options={statusOptions}
            onChange={(value: string) =>
              handleQueryChange({ page: 1, status: value || undefined })
            }
          />
          <SimpleSelect
            allowClear
            showSearch
            style={{ width: 200 }}
            placeholder={intl.formatMessage({
              id: 'requestLogs.filter.model'
            })}
            options={modelOptions}
            onChange={(value: string) =>
              handleQueryChange({ page: 1, model_name: value || undefined })
            }
          />
          {showUser && (
            <Input
              allowClear
              style={{ width: 180 }}
              placeholder={intl.formatMessage({
                id: 'requestLogs.filter.user'
              })}
              onChange={(event) =>
                handleQueryChange({
                  page: 1,
                  user_name: event.target.value || undefined
                })
              }
            />
          )}
          <RangePicker showTime onChange={handleRangeChange} />
          <Button
            loading={exporting}
            onClick={() => exportData(currentFilters())}
          >
            {intl.formatMessage({ id: 'requestLogs.button.export' })}
          </Button>
        </Space>
        <TableLoadGate
          loading={dataSource.loading}
          loadend={dataSource.loadend}
          error={dataSource.error}
          hasRows={!!dataSource.dataList.length}
          onRetry={() => fetchData()}
        >
          <ConfigProvider renderEmpty={renderEmpty}>
            <Table
              className="scroll-table"
              columns={columns}
              dataSource={dataSource.dataList}
              loading={false}
              sortDirections={TABLE_SORT_DIRECTIONS}
              showSorterTooltip={false}
              rowKey={(record) => record.id}
              onChange={handleTableChange}
              pagination={{
                showSizeChanger: true,
                pageSize: queryParams.perPage,
                current: queryParams.page,
                total: dataSource.total,
                hideOnSinglePage: queryParams.perPage === 10,
                onChange: handlePageChange
              }}
            />
          </ConfigProvider>
        </TableLoadGate>
      </PageBox>
      <DetailDrawer
        kind={kind}
        open={detail.open}
        data={detail.data}
        onClose={() => setDetail({ open: false, data: null })}
      />
    </>
  );
};

export default LogPage;
