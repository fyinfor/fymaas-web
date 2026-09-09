import { OPENAI_COMPATIBLE } from '@/config/settings';
import { queryApisKeysList } from '@/pages/api-keys/apis';
import { ListItem as ApiKeyItem } from '@/pages/api-keys/config/types';
import { MODEL_PROXY } from '@/pages/playground/apis';
import { HighlightCode, IconFont, ScrollerModal } from '@gpustack/core-ui';
import { useIntl, useNavigate } from '@umijs/max';
import { Alert, Button, Select, Table, Tabs, Tag } from 'antd';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { modelCategoriesMap } from '../config';
import { ListItem } from '../config/types';
import useGenericProxy from '../hooks/use-generic-proxy';
import {
  ACCESS_LANGUAGES,
  buildAccessExamples,
  schemaForCategory,
  type AccessLanguage
} from './api-access-examples';

const PLACEHOLDER_KEY = 'YOUR_API_KEY';

const secretOf = (item?: ApiKeyItem) =>
  (
    item?.value ||
    (item as ApiKeyItem & { key_prefix?: string })?.key_prefix ||
    ''
  ).trim();

const LANG_MAP: Record<AccessLanguage, string> = {
  curl: 'bash',
  javascript: 'javascript',
  go: 'go',
  python: 'python',
  java: 'java',
  csharp: 'csharp'
};

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
  color: var(--ant-color-text-secondary);
  font-size: 13px;
`;

const SectionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

const CreateButton = styled(Button)`
  padding-inline: 0;
`;

const KeyRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  .label {
    flex: none;
    font-weight: 500;
  }
  .selector {
    flex: 1;
    min-width: 240px;
    max-width: 420px;
  }
`;

interface ApiAccessInfoProps {
  open: boolean;
  data: ListItem;
  onClose: () => void;
}

const ApiAccessInfo = ({ open, data, onClose }: ApiAccessInfoProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { GenericProxyCommandCode, openProxyModal } = useGenericProxy();
  const [language, setLanguage] = useState<AccessLanguage>('curl');
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<number>();
  const [apiKey, setApiKey] = useState(PLACEHOLDER_KEY);
  const [loadingKeys, setLoadingKeys] = useState(false);

  const category = data?.categories?.[0];
  const origin = window.location.origin;
  const endPoint = useMemo(() => {
    if (!data?.generic_proxy) {
      return `${origin}/${OPENAI_COMPATIBLE}`;
    }
    return `${origin}${MODEL_PROXY}/${data.id}/<YOUR_API_PATH>`;
  }, [data, origin]);

  const isRanker = _.includes(data?.categories, modelCategoriesMap.reranker);
  const isLLM = _.includes(data?.categories, modelCategoriesMap.llm);

  const applyKey = (item?: ApiKeyItem) => {
    setSelectedKeyId(item?.id);
    setApiKey(secretOf(item) || PLACEHOLDER_KEY);
  };

  const keyOptions = useMemo(
    () =>
      apiKeys.map((item) => ({
        value: item.id,
        label: item.name
      })),
    [apiKeys]
  );

  const examples = useMemo(
    () =>
      buildAccessExamples({
        origin,
        model: data?.name || '',
        apiKey,
        category
      }),
    [origin, data?.name, apiKey, category]
  );

  const schemaRows = useMemo(
    () => schemaForCategory(data?.name || '', category),
    [data?.name, category]
  );

  useEffect(() => {
    if (open && data?.generic_proxy) {
      openProxyModal(data);
    }
  }, [open, data, openProxyModal]);

  useEffect(() => {
    if (!open) {
      setLanguage('curl');
      setApiKeys([]);
      applyKey(undefined);
      return;
    }
    let cancelled = false;
    setLoadingKeys(true);
    queryApisKeysList({ page: 1, perPage: 100 })
      .then((res) => {
        if (cancelled) return;
        const items = res.items || [];
        setApiKeys(items);
        applyKey(items.find((item) => secretOf(item)) || items[0]);
      })
      .catch(() => {
        if (!cancelled) {
          setApiKeys([]);
          applyKey(undefined);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingKeys(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <ScrollerModal
      open={open}
      style={{ top: '8%' }}
      title={intl.formatMessage({ id: 'models.table.button.apiAccessInfo' })}
      width={760}
      destroyOnHidden
      closable={true}
      mask={{ closable: false }}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
    >
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message={intl.formatMessage({
          id: 'models.table.apiAccessInfo.proxyHint'
        })}
      />
      <MetaRow>
        <span>{endPoint}</span>
        {!data?.generic_proxy && (
          <>
            <Tag color="geekblue" style={{ margin: 0, borderRadius: 12 }}>
              {isRanker
                ? intl.formatMessage({
                    id: 'models.table.apiAccessInfo.jinaCompatible'
                  })
                : intl.formatMessage({
                    id: 'models.table.apiAccessInfo.openaiCompatible'
                  })}
            </Tag>
            {isLLM && (
              <Tag color="geekblue" style={{ margin: 0, borderRadius: 12 }}>
                {intl.formatMessage({
                  id: 'models.table.apiAccessInfo.anthropicCompatible'
                })}
              </Tag>
            )}
          </>
        )}
      </MetaRow>
      <KeyRow>
        <span className="label">
          {intl.formatMessage({ id: 'models.table.apiAccessInfo.apikey' })}
        </span>
        <Select
          className="selector"
          showSearch
          allowClear
          loading={loadingKeys}
          optionFilterProp="label"
          placeholder={intl.formatMessage({
            id: 'models.table.apiAccessInfo.selectKey'
          })}
          value={selectedKeyId ?? null}
          options={keyOptions}
          notFoundContent={intl.formatMessage({
            id: 'models.table.apiAccessInfo.noKey'
          })}
          getPopupContainer={(trigger) =>
            (trigger.parentElement as HTMLElement) || document.body
          }
          onChange={(id?: number | null) => {
            applyKey(
              id == null ? undefined : apiKeys.find((item) => item.id === id)
            );
          }}
        />
        <CreateButton
          type="link"
          size="small"
          onClick={() => navigate('/usage/api-keys')}
        >
          {intl.formatMessage({
            id: 'models.table.apiAccessInfo.gotoCreate'
          })}
          <IconFont type="icon-external-link" className="font-size-14" />
        </CreateButton>
      </KeyRow>

      {data?.generic_proxy ? (
        <div>{GenericProxyCommandCode}</div>
      ) : (
        <>
          <SectionTitle>
            {intl.formatMessage({
              id: 'models.table.apiAccessInfo.examples'
            })}
          </SectionTitle>
          <Tabs
            size="small"
            activeKey={language}
            onChange={(key) => setLanguage(key as AccessLanguage)}
            items={ACCESS_LANGUAGES.map((item) => ({
              key: item.key,
              label: item.label
            }))}
          />
          <HighlightCode
            theme="light"
            lang={LANG_MAP[language]}
            code={examples[language]}
            copyValue={examples[language]}
            copyable
            xScrollable
          />

          <SectionTitle style={{ marginTop: 20 }}>
            {intl.formatMessage({
              id: 'models.table.apiAccessInfo.schemaTitle'
            })}
          </SectionTitle>
          <Table
            size="small"
            pagination={false}
            rowKey="name"
            dataSource={schemaRows}
            columns={[
              {
                title: intl.formatMessage({
                  id: 'models.table.apiAccessInfo.schema.name'
                }),
                dataIndex: 'name',
                width: 140
              },
              {
                title: intl.formatMessage({
                  id: 'models.table.apiAccessInfo.schema.type'
                }),
                dataIndex: 'type',
                width: 100
              },
              {
                title: intl.formatMessage({
                  id: 'models.table.apiAccessInfo.schema.example'
                }),
                dataIndex: 'example',
                ellipsis: true
              },
              {
                title: intl.formatMessage({
                  id: 'models.table.apiAccessInfo.schema.desc'
                }),
                dataIndex: 'descId',
                render: (id: string) => intl.formatMessage({ id })
              }
            ]}
          />
        </>
      )}
    </ScrollerModal>
  );
};

export default ApiAccessInfo;
