import { EmptyState, ListEmpty, TableLoadGate } from '@/components/console';
import { PageAction } from '@/config';
import { TABLE_SORT_DIRECTIONS } from '@/config/settings';
import { PageActionType } from '@/config/types';
import useTableFetch from '@/hooks/use-table-fetch';
import { queryApisKeysList } from '@/pages/api-keys/apis';
import { queryModelRoutes } from '@/pages/model-routes/apis';
import { DeleteModal, FilterBar, IconFont } from '@gpustack/core-ui';
import { useAccess, useIntl } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import { ConfigProvider, Radio, Select, Space, Table, message } from 'antd';
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
import { FormData, IpScope, IpScopeKind, ListItem } from './config/types';
import useRuleColumns from './hooks/use-rule-columns';

const IpAccessControl: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const [kind, setKind] = React.useState<IpScopeKind>(
    access.canSeeAdmin ? 'platform' : 'org'
  );
  const [targetId, setTargetId] = React.useState<number | undefined>();
  const [routes, setRoutes] = React.useState<{ id: number; name: string }[]>(
    []
  );
  const [apiKeys, setApiKeys] = React.useState<{ id: number; name: string }[]>(
    []
  );

  const scope: IpScope = React.useMemo(
    () => ({
      kind,
      scopeId:
        kind === 'model_route' || kind === 'api_key' ? targetId : undefined
    }),
    [kind, targetId]
  );

  const needsTarget = kind === 'model_route' || kind === 'api_key';
  const ready = !needsTarget || !!targetId;

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
    fetchAPI: (params) => queryIpAccessRules(params, scope),
    deleteAPI: (id) => deleteIpAccessRule(id, scope),
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

  React.useEffect(() => {
    if (access.canSeeAdmin) {
      queryModelRoutes({ page: 1, perPage: 100 })
        .then((page) => setRoutes(page.items || []))
        .catch(() => undefined);
      queryApisKeysList({ page: 1, perPage: 100 })
        .then((page) =>
          setApiKeys(
            (page.items || []).map((item: any) => ({
              id: item.id,
              name: item.name || item.description || String(item.id)
            }))
          )
        )
        .catch(() => undefined);
    }
  }, [access.canSeeAdmin]);

  React.useEffect(() => {
    if (ready) {
      fetchData();
    }
  }, [kind, targetId]);

  const refresh = () => {
    if (ready) {
      fetchData();
    }
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
        await updateIpAccessRule(modalStatus.data.id, data, scope);
      } else {
        await createIpAccessRule(data, scope);
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
        await updateIpAccessRule(row.id, { enabled }, scope);
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
      <ListEmpty
        icon={<IconFont type="icon-network" />}
        title={intl.formatMessage({ id: 'ipAccess.noresult.title' })}
        description={intl.formatMessage({
          id: 'ipAccess.noresult.subTitle'
        })}
        noFound={intl.formatMessage({ id: 'ipAccess.noresult.nofound' })}
        queryParams={{ search: queryParams.search }}
        onAdd={handleAdd}
        addText={intl.formatMessage({ id: 'noresult.button.add' })}
      />
    );
  };

  const scopeOptions = [
    ...(access.canSeeAdmin
      ? [
          {
            label: intl.formatMessage({ id: 'ipAccess.scope.platform' }),
            value: 'platform'
          }
        ]
      : []),
    {
      label: intl.formatMessage({ id: 'ipAccess.scope.org' }),
      value: 'org'
    },
    ...(access.canSeeAdmin
      ? [
          {
            label: intl.formatMessage({ id: 'ipAccess.scope.route' }),
            value: 'model_route'
          },
          {
            label: intl.formatMessage({ id: 'ipAccess.scope.apiKey' }),
            value: 'api_key'
          }
        ]
      : [])
  ];

  return (
    <>
      <PageBox>
        <Space wrap style={{ marginTop: 24 }} size={16}>
          {scopeOptions.length > 1 ? (
            <Radio.Group
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setTargetId(undefined);
              }}
              optionType="button"
              options={scopeOptions}
            />
          ) : null}
          {kind === 'model_route' ? (
            <Select
              showSearch
              optionFilterProp="label"
              style={{ minWidth: 260 }}
              placeholder={intl.formatMessage({
                id: 'ipAccess.select.route'
              })}
              value={targetId}
              onChange={setTargetId}
              options={routes.map((item) => ({
                label: item.name,
                value: item.id
              }))}
            />
          ) : null}
          {kind === 'api_key' ? (
            <Select
              showSearch
              optionFilterProp="label"
              style={{ minWidth: 260 }}
              placeholder={intl.formatMessage({
                id: 'ipAccess.select.apiKey'
              })}
              value={targetId}
              onChange={setTargetId}
              options={apiKeys.map((item) => ({
                label: item.name,
                value: item.id
              }))}
            />
          ) : null}
        </Space>
        {ready ? (
          <>
            <PolicyPanel
              key={`${scope.kind}-${scope.scopeId || 0}`}
              rulesVersion={rulesVersion}
              scope={scope}
            />
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
          </>
        ) : (
          <EmptyState
            icon={<IconFont type="icon-network" />}
            title={intl.formatMessage({
              id:
                kind === 'api_key'
                  ? 'ipAccess.select.apiKey'
                  : 'ipAccess.select.route'
            })}
            description={intl.formatMessage({
              id: 'ipAccess.page.description'
            })}
            style={{ minHeight: 'calc(100vh - 360px)' }}
          />
        )}
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
