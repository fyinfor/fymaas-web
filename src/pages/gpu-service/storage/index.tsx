import { ListEmpty, TableLoadGate } from '@/components/console';
import { PageAction } from '@/config';
import { PaginationKey, TABLE_SORT_DIRECTIONS } from '@/config/settings';
import useTableFetch from '@/hooks/use-table-fetch';
import { DeleteModal, FilterBar, IconFont } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import { ConfigProvider, message, Table } from 'antd';
import { useEffect } from 'react';
import PageBox from '../../_components/page-box';
import {
  deleteGPUServiceStorage,
  GPU_SERVICE_STORAGE_API,
  queryGPUServiceStorage
} from './apis';
import AddModal from './components/add-modal';
import { FormData, ListItem } from './config/types';
import useCreateStorageModal from './hooks/use-create-storage-modal';
import useStorageColumns from './hooks/use-storage-columns';
import useCreateStorage from './services/use-create-storage';
import useQueryStorageClass from './services/use-query-storage-class';
import useUpdateStorage from './services/use-update-storage';

const GPUServiceStorage: React.FC = () => {
  const intl = useIntl();

  const {
    dataSource,
    rowSelection,
    queryParams,
    sortOrder,
    modalRef,
    handleDelete,
    handleDeleteBatch,
    fetchData,
    handlePageChange,
    handleTableChange,
    handleSearch,
    handleNameChange
  } = useTableFetch<ListItem>({
    key: PaginationKey.Storage,
    fetchAPI: queryGPUServiceStorage,
    deleteAPI: deleteGPUServiceStorage,
    watch: false,
    API: GPU_SERVICE_STORAGE_API,
    contentForDelete: intl.formatMessage({ id: 'gpuservice.storage' })
  });
  const { storageClassList, fetchData: fetchStorageClass } =
    useQueryStorageClass();
  const { fetchData: createStorage } = useCreateStorage();
  const { fetchData: updateStorage } = useUpdateStorage();
  const { openStorageModalStatus, openStorageModal, closeStorageModal } =
    useCreateStorageModal();

  useEffect(() => {
    fetchStorageClass({ page: -1 });
  }, []);

  const handleAddStorage = () => {
    openStorageModal(
      PageAction.CREATE,
      intl.formatMessage({ id: 'gpuservice.storage.add' })
    );
  };

  const handleEditStorage = (row: ListItem) => {
    openStorageModal(
      PageAction.EDIT,
      intl.formatMessage({ id: 'gpuservice.storage.edit' }),
      row
    );
  };

  const handleModalOk = async (data: FormData) => {
    try {
      if (openStorageModalStatus.action === PageAction.EDIT) {
        await updateStorage({
          id: openStorageModalStatus.currentData!.id,
          data: {
            owner_principal_id: data.owner_principal_id,
            displayName: data.displayName,
            description: data.description
          }
        });
      } else {
        await createStorage({ data });
      }

      fetchData();
      closeStorageModal();
      message.success(intl.formatMessage({ id: 'common.message.success' }));
    } catch (error) {
      // it's handled in interceptor
    }
  };

  const handleSelect = useMemoizedFn((val: string, row: ListItem) => {
    if (val === 'edit') {
      handleEditStorage(row);
    } else if (val === 'delete') {
      handleDelete({
        ...row,
        id: row.id
      });
    }
  });

  const renderEmpty = (type?: string) => {
    if (type !== 'Table') return;
    return (
      <ListEmpty
        icon={<IconFont type="icon-database-outlined" />}
        title={intl.formatMessage({ id: 'noresult.gpuservice.storage.title' })}
        description={intl.formatMessage({
          id: 'noresult.gpuservice.storage.subTitle'
        })}
        noFound={intl.formatMessage({
          id: 'noresult.gpuservice.storage.nofound'
        })}
        queryParams={{ search: queryParams.search }}
        onAdd={handleAddStorage}
        addText={intl.formatMessage({ id: 'noresult.button.add' })}
      />
    );
  };

  const columns = useStorageColumns({
    handleSelect,
    storageClassList,
    sortOrder
  });

  return (
    <>
      <PageBox>
        <FilterBar
          marginBottom={22}
          marginTop={30}
          showSelect={false}
          buttonText={intl.formatMessage({ id: 'gpuservice.storage.add' })}
          handleSearch={handleSearch}
          handleDeleteByBatch={handleDeleteBatch}
          handleClickPrimary={handleAddStorage}
          handleInputChange={handleNameChange}
          rowSelection={rowSelection}
          widths={{ input: 300 }}
        />
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
              rowSelection={rowSelection}
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
      <AddModal
        open={openStorageModalStatus.open}
        action={openStorageModalStatus.action}
        title={openStorageModalStatus.title}
        data={openStorageModalStatus.currentData}
        onCancel={closeStorageModal}
        onOk={handleModalOk}
      />
      <DeleteModal ref={modalRef} />
    </>
  );
};

export default GPUServiceStorage;
