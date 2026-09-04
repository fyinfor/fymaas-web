import { modelsExpandKeysAtom, modelsSessionAtom } from '@/atoms/models';
import { ErrorState, ListEmpty } from '@/components/console';
import { PageAction } from '@/config';
import useTableFetch from '@/hooks/use-table-fetch';
import { IS_FIRST_LOGIN, writeState } from '@/utils/localstore/index';
import { SearchOutlined } from '@ant-design/icons';
import {
  IconFont,
  InfiniteScrollerProvider,
  useBodyScroll
} from '@gpustack/core-ui';
import { useIntl, useNavigate } from '@umijs/max';
import { Button, Input, Space, message } from 'antd';
import { useAtom } from 'jotai';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import PageBox, { usePageSurface } from '../_components/page-box';
import { useSourceConfigVisible } from '../_components/source-config';
import { createModel, queryCatalogItemSpec, queryCatalogList } from './apis';
import CatalogList from './components/catalog/catalog-list';
import CatalogSourceEntry from './components/catalog/catalog-source-entry';
import CategoryChips from './components/category-chips';
import DelopyBuiltInModal from './components/deployment/deploy-builtin-modal';
import { modelSourceMap } from './config';
import { CatalogItem as CatalogItemType, FormData } from './config/types';

const Catalog: React.FC = () => {
  const intl = useIntl();
  usePageSurface('canvas');
  // Gated here rather than inside the entry: a `Space` item that renders
  // nothing still takes its gap.
  const showSourceEntry = useSourceConfigVisible();
  const {
    dataSource,
    queryParams,
    fetchData,
    handleQueryChange,
    loadMore,
    handleNameChange
  } = useTableFetch<CatalogItemType>({
    fetchAPI: queryCatalogList,
    watch: false,
    isInfiniteScroll: true,
    defaultQueryParams: {
      perPage: 24
    }
  });
  const { saveScrollHeight, restoreScrollHeight } = useBodyScroll();
  const navigate = useNavigate();

  const [openDeployModal, setOpenDeployModal] = useState<any>({
    show: false,
    width: 600,
    current: {},
    source: modelSourceMap.huggingface_value
  });
  const [, setModelsExpandKeys] = useAtom(modelsExpandKeysAtom);
  const [, setModelsSession] = useAtom(modelsSessionAtom);
  const sourceRef = React.useRef<string>('');

  const handleDeployModalCancel = () => {
    setOpenDeployModal({
      ...openDeployModal,
      show: false
    });
    restoreScrollHeight();
  };

  const handleOnDeploy = useCallback(async (item: CatalogItemType) => {
    saveScrollHeight();
    setOpenDeployModal({
      show: true,
      source: sourceRef.current,
      current: item,
      width: 600
    });
  }, []);

  const handleCreateModel = useCallback(
    async (data: FormData) => {
      try {
        const modelData = await createModel({
          data: {
            ..._.omit(data, ['size', 'quantization'])
          }
        });
        writeState(IS_FIRST_LOGIN, false);
        setOpenDeployModal({
          ...openDeployModal,
          show: false
        });
        message.success(intl.formatMessage({ id: 'common.message.success' }));
        setModelsExpandKeys([modelData.id]);
        navigate('/models/deployments');
      } catch (error) {}
    },
    [openDeployModal]
  );

  const handleCategoryChange = (value: string) => {
    handleQueryChange({
      categories: value || undefined,
      page: 1
    });
  };

  const handleDeployFromOtherHubs = async () => {
    try {
      setModelsSession({
        source: sourceRef.current || modelSourceMap.huggingface_value
      });
    } catch (error) {}
    navigate('/models/deployments');
  };

  const handleSearch = () => {
    fetchData({ query: { ...queryParams, page: 1 } });
  };

  useEffect(() => {
    if (dataSource.loadend) {
      const getCatalogSource = async () => {
        try {
          const id = dataSource.dataList?.[0]?.id;
          if (id) {
            const res: any = await queryCatalogItemSpec({
              id,
              cluster_id: null
            });
            sourceRef.current = res?.items?.[0]?.source;
          }
        } catch (error) {}
      };
      getCatalogSource();
    }
  }, [dataSource.loadend]);

  return (
    <PageBox>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 20
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={intl.formatMessage({ id: 'common.filter.name' })}
            style={{ width: 320 }}
            onChange={handleNameChange}
            onPressEnter={handleSearch}
          />
          <Space size={12}>
            {showSourceEntry && (
              <CatalogSourceEntry onSaved={handleSearch}></CatalogSourceEntry>
            )}
            <Button
              icon={<SearchOutlined />}
              type="primary"
              onClick={handleDeployFromOtherHubs}
            >
              {intl.formatMessage({ id: 'models.catalog.button.explore' })}
            </Button>
          </Space>
        </div>
        <CategoryChips
          value={queryParams.categories}
          onChange={handleCategoryChange}
        />
      </div>
      <InfiniteScrollerProvider
        value={{
          total: dataSource.totalPage,
          current: queryParams.page,
          loading: dataSource.loading,
          refresh: loadMore,
          throttleDelay: 300
        }}
      >
        <CatalogList
          dataList={dataSource.dataList}
          loading={dataSource.loading}
          onDeploy={handleOnDeploy}
          activeId={-1}
          isFirst={!dataSource.loadend}
        ></CatalogList>
        {dataSource.loadend &&
          (dataSource.error && !dataSource.dataList.length ? (
            <ErrorState
              onRetry={handleSearch}
              style={{ minHeight: 'calc(100vh - 300px)' }}
            />
          ) : !dataSource.dataList.length ? (
            <ListEmpty
              icon={<IconFont type="icon-layers" />}
              title={intl.formatMessage({ id: 'noresult.catalog.title' })}
              description={intl.formatMessage({
                id: 'noresult.catalog.subTitle'
              })}
              noFound={intl.formatMessage({
                id: 'noresult.catalog.nofound'
              })}
              queryParams={queryParams}
            />
          ) : null)}
      </InfiniteScrollerProvider>
      <DelopyBuiltInModal
        open={openDeployModal.show}
        action={PageAction.CREATE}
        title={intl.formatMessage({ id: 'models.button.deploy' })}
        source={openDeployModal.source}
        width={openDeployModal.width}
        current={openDeployModal.current}
        onCancel={handleDeployModalCancel}
        onOk={handleCreateModel}
      ></DelopyBuiltInModal>
    </PageBox>
  );
};

export default Catalog;
