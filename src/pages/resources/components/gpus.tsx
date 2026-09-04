import {
  EmptyState,
  ErrorState,
  TableSkeleton,
  hasActiveFilters
} from '@/components/console';
import { PaginationKey, TABLE_SORT_DIRECTIONS } from '@/config/settings';
import useTableFetch from '@/hooks/use-table-fetch';
import PageBox from '@/pages/_components/page-box';
import { useQueryClusterList } from '@/pages/cluster-management/services/use-query-cluster-list';
import { FilterBar, IconFont } from '@gpustack/core-ui';
import { useIntl, useSearchParams } from '@umijs/max';
import { ConfigProvider, Table } from 'antd';
import { useEffect, useState } from 'react';
import { GPU_DEVICES_API, queryGpuDevicesList } from '../apis';
import { GPUDeviceItem } from '../config/types';
import useGPUColumns from '../hooks/use-gpu-columns';

// Optional ``clusterId`` pins the list to a single cluster (used by
// the cluster-detail page) and hides the cluster-filter dropdown so
// the user can't change scope away from the cluster they're already
// inside.
interface GPUListProps {
  clusterId?: number;
  source?: 'clusterDetail';
}

const GPUList: React.FC<GPUListProps> = ({ clusterId, source }) => {
  const {
    dataSource,
    queryParams,
    extraStatus,
    sortOrder,
    handlePageChange,
    handleTableChange,
    handleQueryChange,
    handleSearch,
    handleNameChange,
    fetchData
  } = useTableFetch<GPUDeviceItem>({
    key: PaginationKey.GPUs,
    fetchAPI: queryGpuDevicesList,
    polling: true,
    API: GPU_DEVICES_API,
    defaultQueryParams: clusterId ? { cluster_id: clusterId } : undefined
  });
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page');
  const intl = useIntl();
  const [clusterList, setClusterList] = useState<Global.BaseOption<number>[]>(
    []
  );
  const { fetchClusterList } = useQueryClusterList({
    useStateData: false
  });

  const getClusterList = async () => {
    try {
      const items = await fetchClusterList({ page: -1 });
      const list = items?.map((item) => ({
        label: item.name,
        value: item.id
      }));
      setClusterList(list || []);
    } catch (error) {
      setClusterList([]);
    }
  };

  const handleClusterChange = (value: number) => {
    handleQueryChange({
      page: 1,
      cluster_id: value
    });
  };

  const renderEmpty = (type?: string) => {
    if (type !== 'Table') return;
    const filtered = hasActiveFilters(
      queryParams,
      source === 'clusterDetail'
        ? ['sort_by', 'page', 'perPage', 'cluster_id']
        : ['sort_by', 'page', 'perPage']
    );
    return (
      <EmptyState
        icon={<IconFont type="icon-gpu1" />}
        title={intl.formatMessage({
          id: filtered ? 'noresult.gpus.nofound' : 'noresult.gpus.title'
        })}
        description={
          filtered
            ? undefined
            : intl.formatMessage({ id: 'noresult.gpus.subTitle' })
        }
        style={{ minHeight: 'calc(100vh - 300px)' }}
      />
    );
  };

  const firstLoad = dataSource.loading && !dataSource.loadend;
  const loadFailed = dataSource.error && !dataSource.dataList.length;

  const columns = useGPUColumns({
    clusterList,
    loadend: dataSource.loadend,
    sortOrder,
    firstLoad: extraStatus.firstLoad
  });

  useEffect(() => {
    console.log('columns changed!');
  }, [columns]);

  useEffect(() => {
    getClusterList();
  }, []);

  return (
    <>
      <PageBox>
        <FilterBar
          marginBottom={22}
          buttonText={intl.formatMessage({ id: 'resources.button.create' })}
          selectHolder={intl.formatMessage({ id: 'clusters.filterBy.cluster' })}
          handleSearch={handleSearch}
          handleInputChange={handleNameChange}
          handleSelectChange={handleClusterChange}
          selectOptions={clusterList}
          showSelect={source !== 'clusterDetail'}
          widths={
            source !== 'clusterDetail'
              ? { select: 230, input: 230 }
              : { input: 300 }
          }
        ></FilterBar>
        {firstLoad ? (
          <TableSkeleton rows={6} columns={6} />
        ) : loadFailed ? (
          <ErrorState
            onRetry={() => fetchData()}
            style={{ minHeight: 'calc(100vh - 300px)' }}
          />
        ) : (
          <ConfigProvider renderEmpty={renderEmpty}>
            <Table
              columns={columns}
              sortDirections={TABLE_SORT_DIRECTIONS}
              showSorterTooltip={false}
              scroll={{ x: 'max-content' }}
              className={'scroll-table'}
              dataSource={dataSource.dataList}
              loading={false}
              rowKey="id"
              onChange={handleTableChange}
              pagination={{
                showSizeChanger: true,
                pageSize: queryParams.perPage,
                current: queryParams.page,
                total: dataSource.total,
                hideOnSinglePage: queryParams.perPage === 10,
                onChange: handlePageChange
              }}
            ></Table>
          </ConfigProvider>
        )}
      </PageBox>
    </>
  );
};

export default GPUList;
