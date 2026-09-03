import { request } from '@umijs/max';
import { AuditLogFilters, ListItem } from '../config/types';

export const AUDIT_LOGS_API = '/audit-logs';

export async function queryAuditLogs(params: Global.SearchParams) {
  return request<Global.PageResponse<ListItem>>(AUDIT_LOGS_API, {
    method: 'GET',
    params
  });
}

/**
 * Action names present in the trail, for the filter dropdown.
 *
 * Read from the server rather than hardcoded: actions are derived from
 * request paths at write time, so a static list would drift as routes
 * are added.
 */
export async function queryAuditActions() {
  return request<string[]>(`${AUDIT_LOGS_API}/actions`, {
    method: 'GET'
  });
}

export async function queryAuditResourceTypes() {
  return request<string[]>(`${AUDIT_LOGS_API}/resource-types`, {
    method: 'GET'
  });
}

export async function downloadAuditLogs(params: AuditLogFilters) {
  return request(`${AUDIT_LOGS_API}/export`, {
    method: 'GET',
    params,
    responseType: 'blob',
    // Keep the headers: the filename comes from Content-Disposition.
    getResponse: true,
    // A failure arrives as a blob, so the shared interceptor cannot read
    // the message out of it — the caller handles that instead.
    skipErrorHandler: true
  });
}
