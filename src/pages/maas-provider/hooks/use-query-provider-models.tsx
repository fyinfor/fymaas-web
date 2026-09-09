import { createAxiosToken, ErrorMessage } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { useRequest } from 'ahooks';
import { message, notification, Typography } from 'antd';
import { CancelTokenSource } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import {
  queryProviderModels,
  queryProviderModelsInEditing,
  testProviderModel,
  testProviderModelInEditing
} from '../apis';
import { maasProviderLabelMap } from '../config/providers';

/**
 *
 * @returns loading, fetch, dataList
 */
const isCanceled = (error: any) => {
  return Boolean(
    error?.code === 'ERR_CANCELED' ||
    error?.message === 'canceled' ||
    error?.__CANCEL__
  );
};

type FetchModelsErrorInfo = {
  provider?: string;
  status?: string;
  reason: string;
  helpUrl?: string;
  detail: string;
};

const extractUrl = (text: string): string | undefined => {
  const matched = text.match(/https?:\/\/[^\s"'<>]+/);
  return matched?.[0]?.replace(/[)\].,]+$/, '');
};

const parseFetchModelsError = (
  error: any,
  fallback: string,
  fallbackProvider?: string
): FetchModelsErrorInfo => {
  const raw =
    `${error?.response?.data?.message || error?.message || ''}`.trim();
  const detail = raw || fallback;
  const info: FetchModelsErrorInfo = {
    provider: fallbackProvider,
    reason: fallback,
    detail
  };

  const providerMatch = raw.match(
    /Failed to get models from (?:ModelProviderTypeEnum\.)?([A-Za-z0-9_-]+)/i
  );
  if (providerMatch?.[1]) {
    info.provider = providerMatch[1].toLowerCase();
  }

  const statusMatch = raw.match(/\b([1-5]\d{2})\b/);
  if (statusMatch?.[1]) {
    info.status = statusMatch[1];
  }

  const jsonStart = raw.indexOf('{');
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(raw.slice(jsonStart));
      const nested =
        (typeof parsed?.error === 'object' && parsed.error?.message) ||
        parsed?.message;
      if (nested) {
        const text = String(nested);
        info.helpUrl = extractUrl(text);
        info.reason = text.replace(/\s+For details, see:.*$/i, '').trim();
      }
    } catch {
      // keep prefix parsing below
    }
  }

  if (info.reason === fallback) {
    const stripped = raw
      .replace(/^Failed to get models from [^:]+:\s*/i, '')
      .replace(/^\d+\s*/, '')
      .replace(/\s+For details, see:.*$/i, '')
      .trim();
    if (stripped && !stripped.startsWith('{')) {
      info.reason = stripped;
    }
  }

  info.helpUrl = info.helpUrl || extractUrl(raw);
  return info;
};

const ErrorField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children
}) => (
  <div style={{ marginBottom: 8 }}>
    <div
      style={{
        color: 'var(--ant-color-text-secondary)',
        fontSize: 12,
        marginBottom: 2
      }}
    >
      {label}
    </div>
    <div style={{ wordBreak: 'break-word' }}>{children}</div>
  </div>
);

export const useQueryProviderModels = () => {
  const intl = useIntl();
  const axiosTokenRef = useRef<CancelTokenSource | null>(null);
  const lastProviderTypeRef = useRef<string>('');
  const [providerModelList, setProviderModelList] = useState<any[]>([]);

  const {
    run: fetchProviderModels,
    loading,
    cancel
  } = useRequest(
    async (params: {
      id: number;
      data: {
        api_token: string;
        config: { type: string; [key: string]: any };
        proxy_url: string;
      };
    }) => {
      lastProviderTypeRef.current = params.data?.config?.type || '';
      axiosTokenRef.current?.cancel();
      axiosTokenRef.current = createAxiosToken();
      if (params.id) {
        return await queryProviderModelsInEditing(params, {
          token: axiosTokenRef.current.token
        });
      }
      return await queryProviderModels(params, {
        token: axiosTokenRef.current.token
      });
    },
    {
      manual: true,
      onSuccess: (response) => {
        setProviderModelList(
          response.data?.map((item: any) => ({
            label: item.id,
            value: item.id,
            accessible: item.accessible,
            category: item.categories?.[0] || ''
          })) || []
        );
      },
      onError: (error: any) => {
        setProviderModelList([]);
        if (isCanceled(error)) {
          return;
        }
        const info = parseFetchModelsError(
          error,
          intl.formatMessage({
            id: 'providers.form.models.fetchFailedUnknown'
          }),
          lastProviderTypeRef.current
        );
        const providerKey =
          info.provider && maasProviderLabelMap[info.provider];
        const providerLabel = providerKey
          ? `${intl.formatMessage({ id: providerKey })} (${info.provider})`
          : info.provider;
        notification.error({
          message: intl.formatMessage({
            id: 'providers.form.models.fetchFailedTitle'
          }),
          description: (
            <div>
              <ErrorField
                label={intl.formatMessage({
                  id: 'providers.form.models.fetchFailedReason'
                })}
              >
                {info.reason}
              </ErrorField>
              {providerLabel ? (
                <ErrorField
                  label={intl.formatMessage({
                    id: 'providers.form.models.fetchFailedProvider'
                  })}
                >
                  {providerLabel}
                </ErrorField>
              ) : null}
              {info.status ? (
                <ErrorField
                  label={intl.formatMessage({
                    id: 'providers.form.models.fetchFailedStatus'
                  })}
                >
                  {info.status}
                </ErrorField>
              ) : null}
              {info.helpUrl ? (
                <ErrorField
                  label={intl.formatMessage({
                    id: 'providers.form.models.fetchFailedHelp'
                  })}
                >
                  <Typography.Link href={info.helpUrl} target="_blank">
                    {info.helpUrl}
                  </Typography.Link>
                </ErrorField>
              ) : null}
              <ErrorField
                label={intl.formatMessage({
                  id: 'providers.form.models.fetchFailedDetail'
                })}
              >
                <div
                  style={{
                    padding: '8px 10px',
                    background: 'var(--ant-color-fill-tertiary)',
                    borderRadius: 6,
                    fontSize: 12,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  {info.detail}
                </div>
              </ErrorField>
              <div style={{ color: 'var(--ant-color-text-secondary)' }}>
                {intl.formatMessage({
                  id: 'providers.form.models.fetchFailedHint'
                })}
              </div>
            </div>
          ),
          duration: 0,
          placement: 'top',
          style: { width: 480 }
        });
      }
    }
  );

  // the list belongs to the provider it was fetched for — drop it, and any
  // in-flight request that would repopulate it, once that provider is gone
  const resetProviderModels = () => {
    cancel();
    axiosTokenRef.current?.cancel();
    setProviderModelList([]);
  };

  useEffect(() => {
    return () => {
      cancel();
      axiosTokenRef.current?.cancel();
    };
  }, []);

  return {
    loading,
    providerModelList,
    fetchProviderModels,
    resetProviderModels
  };
};

export const useTestProviderModel = () => {
  const axiosTokenRef = useRef<CancelTokenSource | null>(null);

  const {
    runAsync: runTestModel,
    loading,
    cancel
  } = useRequest(
    async (params: {
      id: number;
      data: {
        api_token: string;
        config: { type: string; [key: string]: any };
        model_name: string;
        proxy_url: string;
      };
    }) => {
      axiosTokenRef.current?.cancel();
      axiosTokenRef.current = createAxiosToken();

      // for edit page
      if (params.id) {
        return await testProviderModelInEditing(params, {
          token: axiosTokenRef.current.token
        });
      }
      // for create page
      return await testProviderModel(params, {
        token: axiosTokenRef.current.token
      });
    },
    {
      manual: true,
      onSuccess: (response) => {
        if (!response?.accessible) {
          message.error({
            content: (
              <ErrorMessage
                errMsg={response?.error_message || 'Test model failed'}
              ></ErrorMessage>
            )
          });
        }
      },
      onError: (error) => {
        message.error({
          content: (
            <ErrorMessage
              errMsg={error?.message || 'Test model failed'}
            ></ErrorMessage>
          )
        });
      }
    }
  );

  useEffect(() => {
    return () => {
      cancel();
      axiosTokenRef.current?.cancel();
    };
  }, []);

  return {
    loading,
    runTestModel
  };
};
