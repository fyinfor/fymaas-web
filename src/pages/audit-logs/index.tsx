import { ListEmpty, TableLoadGate } from '@/components/console';
import { TABLE_SORT_DIRECTIONS } from '@/config/settings';
import useTableFetch from '@/hooks/use-table-fetch';
import { IconFont, SimpleSelect } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { useMemoizedFn, useRequest } from 'ahooks';
import { Button, ConfigProvider, DatePicker, Input, Space, Table } from 'antd';
import type { Dayjs } from 'dayjs';
import _ from 'lodash';
import React from 'react';
import PageBox from '../_components/page-box';
import {
  queryAuditActions,
  queryAuditLogs,
  queryAuditResourceTypes
} from './apis';
import DetailDrawer from './components/detail-drawer';
import { AuditLogFilters, ListItem } from './config/types';
import useAuditLogColumns from './hooks/use-audit-log-columns';
import useExportAuditLogs from './services/use-export-audit-logs';

const { RangePicker } = DatePicker;

const AuditLogs: React.FC = () => {
  const intl = useIntl();

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
    fetchAPI: queryAuditLogs,
    watch: false,
    polling: false
  });

  // Built from what is actually in the trail: action names are derived
  // from request paths server-side, so a hardcoded list would drift as
  // routes are added.
  const { data: actions } = useRequest(queryAuditActions, {
    onError: () => undefined
  });
  const { data: resourceTypes } = useRequest(queryAuditResourceTypes, {
    onError: () => undefined
  });

  const { exporting, exportData } = useExportAuditLogs();

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

  const currentFilters = (): AuditLogFilters =>
    _.pickBy(
      _.pick(queryParams, [
        'action',
        'resource_type',
        'result',
        'start_time',
        'end_time'
      ]),
      (value: any) => value !== undefined && value !== ''
    ) as AuditLogFilters;

  const handleExport = () => {
    // Export what is on screen: the same filters, minus pagination.
    // Anything else would hand back a file that does not match what the
    // reviewer was looking at.
    exportData(currentFilters());
  };

  const actionOptions = React.useMemo(
    () => (actions || []).map((action) => ({ label: action, value: action })),
    [actions]
  );
  const resourceTypeOptions = React.useMemo(
    () => (resourceTypes || []).map((type) => ({ label: type, value: type })),
    [resourceTypes]
  );

  const resultOptions = React.useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'auditLogs.result.success' }),
        value: 'success'
      },
      {
        label: intl.formatMessage({ id: 'auditLogs.result.failure' }),
        value: 'failure'
      }
    ],
    [intl]
  );

  const columns = useAuditLogColumns({ onView: handleView, sortOrder });

  const renderEmpty = (type?: string) => {
    if (type !== 'Table') return;
    return (
      <ListEmpty
        icon={<IconFont type="icon-logs" />}
        title={intl.formatMessage({ id: 'auditLogs.noresult.title' })}
        description={intl.formatMessage({ id: 'auditLogs.noresult.subTitle' })}
        noFound={intl.formatMessage({ id: 'auditLogs.noresult.nofound' })}
        queryParams={{
          search: queryParams.search,
          action: queryParams.action,
          result: queryParams.result
        }}
      />
    );
  };

  return (
    <>
      <PageBox>
        <Space wrap style={{ marginTop: 30, marginBottom: 22 }}>
          <Input.Search
            allowClear
            style={{ width: 260 }}
            placeholder={intl.formatMessage({
              id: 'auditLogs.filter.search'
            })}
            onChange={handleNameChange}
            onSearch={() => fetchData()}
          />
          <SimpleSelect
            allowClear
            showSearch
            style={{ width: 220 }}
            placeholder={intl.formatMessage({ id: 'auditLogs.filter.action' })}
            options={actionOptions}
            onChange={(value: string) =>
              handleQueryChange({ page: 1, action: value || undefined })
            }
          />
          <SimpleSelect
            allowClear
            showSearch
            style={{ width: 200 }}
            placeholder={intl.formatMessage({
              id: 'auditLogs.filter.resourceType'
            })}
            options={resourceTypeOptions}
            onChange={(value: string) =>
              handleQueryChange({
                page: 1,
                resource_type: value || undefined
              })
            }
          />
          <SimpleSelect
            allowClear
            style={{ width: 160 }}
            placeholder={intl.formatMessage({ id: 'auditLogs.filter.result' })}
            options={resultOptions}
            onChange={(value: string) =>
              handleQueryChange({ page: 1, result: value || undefined })
            }
          />
          <RangePicker showTime onChange={handleRangeChange} />
          <Button loading={exporting} onClick={handleExport}>
            {intl.formatMessage({ id: 'auditLogs.button.export' })}
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
              className={'scroll-table'}
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
        open={detail.open}
        data={detail.data}
        onClose={() => setDetail({ open: false, data: null })}
      />
    </>
  );
};

export default AuditLogs;
