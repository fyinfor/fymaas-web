import { PageAction } from '@/config';
import { TABLE_SORT_DIRECTIONS } from '@/config/settings';
import { PageActionType } from '@/config/types';
import useTableFetch from '@/hooks/use-table-fetch';
import { DeleteModal, FilterBar, IconFont, NoResult } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import { ConfigProvider, Table, message } from 'antd';
import _ from 'lodash';
import React from 'react';
import PageBox from '../_components/page-box';
import {
  createIpAccessRule,
  deleteIpAccessRule,
  queryIpAccessRules,
  updateIpAccessRule
} from './apis';
import AddRuleModal from './components/add-rule-modal';
import PolicyPanel from './components/policy-panel';
import { FormData, ListItem } from './config/types';
import useRuleColumns from './hooks/use-rule-columns';

const IpAccessControl: React.FC = () => {
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
    fetchAPI: queryIpAccessRules,
    deleteAPI: deleteIpAccessRule,
    watch: false,
    polling: false,
    contentForDelete: intl.formatMessage({ id: 'ipAccess.rule' })
  });

  // Any rule change invalidates the policy panel's test verdict.
  const [rulesVersion, setRulesVersion] = React.useState(0);
  const [modalStatus, setModalStatus] = React.useState<{
    open: boolean;
    action: PageActionType;
    title: string;
    data?: ListItem | null;
  }>({ open: false, action: PageAction.CREATE, title: '' });

  const refresh = () => {
    fetchData();
    setRulesVersion((version) => version + 1);
  };

  const handleAdd = () => {
    setModalStatus({
      open: true,
      action: PageAction.CREATE,
      title: intl.formatMessage({ id: 'ipAccess.rule.add' }),
      data: null
    });
  };

  const handleEdit = (row: ListItem) => {
    setModalStatus({
      open: true,
      action: PageAction.EDIT,
      title: intl.formatMessage({ id: 'ipAccess.rule.edit' }),
      data: row
    });
  };

  const closeModal = () => {
    setModalStatus((status) => ({ ...status, open: false }));
  };

  const handleModalOk = async (data: FormData) => {
    try {
      if (modalStatus.action === PageAction.EDIT && modalStatus.data) {
        await updateIpAccessRule(modalStatus.data.id, data);
      } else {
        await createIpAccessRule(data);
      }
      refresh();
      closeModal();
      message.success(intl.formatMessage({ id: 'common.message.success' }));
    } catch (error) {
      // handled by the interceptor
    }
  };

  const handleToggleEnabled = useMemoizedFn(
    async (row: ListItem, enabled: boolean) => {
      try {
        await updateIpAccessRule(row.id, { enabled });
        refresh();
      } catch (error) {
        // handled by the interceptor
      }
    }
  );

  const handleSelect = useMemoizedFn((val: string, row: ListItem) => {
    if (val === 'edit') {
      handleEdit(row);
    } else if (val === 'delete') {
      handleDelete({ ...row, name: row.name }, { afterDelete: refresh });
    }
  });

  const columns = useRuleColumns({
    handleSelect,
    onToggleEnabled: handleToggleEnabled,
    sortOrder
  });

  const renderEmpty = (type?: string) => {
    if (type !== 'Table') return;
    return (
      <NoResult
        minHeight="calc(100vh - 400px)"
        loading={dataSource.loading}
        loadend={dataSource.loadend}
        dataSource={dataSource.dataList}
        image={<IconFont type="icon-network" />}
        filters={_.pick(queryParams, ['search'])}
        noFoundText={intl.formatMessage({ id: 'ipAccess.noresult.nofound' })}
        title={intl.formatMessage({ id: 'ipAccess.noresult.title' })}
        subTitle={intl.formatMessage({ id: 'ipAccess.noresult.subTitle' })}
        onClick={handleAdd}
        buttonText={intl.formatMessage({ id: 'noresult.button.add' })}
      />
    );
  };

  return (
    <>
      <PageBox>
        <PolicyPanel rulesVersion={rulesVersion} />
        <FilterBar
          marginBottom={22}
          showSelect={false}
          inputHolder={intl.formatMessage({ id: 'ipAccess.filter.name' })}
          buttonText={intl.formatMessage({ id: 'ipAccess.rule.add' })}
          handleSearch={handleSearch}
          handleDeleteByBatch={() =>
            handleDeleteBatch({ afterDelete: refresh })
          }
          handleClickPrimary={handleAdd}
          handleInputChange={handleNameChange}
          rowSelection={rowSelection}
          widths={{ input: 300 }}
        />
        <ConfigProvider renderEmpty={renderEmpty}>
          <Table
            className={'scroll-table'}
            columns={columns}
            dataSource={dataSource.dataList}
            rowSelection={rowSelection}
            loading={{ spinning: dataSource.loading, size: 'middle' }}
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
      </PageBox>
      <AddRuleModal
        open={modalStatus.open}
        action={modalStatus.action}
        title={modalStatus.title}
        data={modalStatus.data}
        onCancel={closeModal}
        onOk={handleModalOk}
      />
      <DeleteModal ref={modalRef} />
    </>
  );
};

export default IpAccessControl;
