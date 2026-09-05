import { request } from '@umijs/max';
import {
  ListItem,
  LogFilters,
  LogKind,
  LogMeta,
  LogStat
} from '../config/types';

const kindPath = (kind: LogKind) =>
  kind === 'task' ? '/usage/task-logs' : '/usage/request-logs';

export async function queryRequestLogs(
  kind: LogKind,
  params: Global.SearchParams
) {
  return request<Global.PageResponse<ListItem>>(kindPath(kind), {
    method: 'GET',
    params
  });
}

export async function queryRequestLogStat(kind: LogKind, params: LogFilters) {
  return request<LogStat>(`${kindPath(kind)}/stat`, {
    method: 'GET',
    params
  });
}

export async function queryRequestLogMeta(
  kind: LogKind,
  params: { scope?: string }
) {
  return request<LogMeta>(`${kindPath(kind)}/meta`, {
    method: 'GET',
    params
  });
}

export async function downloadRequestLogs(kind: LogKind, params: LogFilters) {
  return request(`${kindPath(kind)}/export`, {
    method: 'GET',
    params,
    responseType: 'blob',
    getResponse: true,
    skipErrorHandler: true
  });
}
