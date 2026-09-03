import { request } from '@umijs/max';
import { FormData, ListItem } from '../config/types';

export const QUOTA_POLICIES_API = '/quota-policies';

export async function queryQuotaPolicies(params: Global.SearchParams) {
  return request<Global.PageResponse<ListItem>>(QUOTA_POLICIES_API, {
    method: 'GET',
    params
  });
}

export async function createQuotaPolicy(data: FormData) {
  return request<ListItem>(QUOTA_POLICIES_API, { method: 'POST', data });
}

export async function updateQuotaPolicy(id: number, data: Partial<FormData>) {
  return request<ListItem>(`${QUOTA_POLICIES_API}/${id}`, {
    method: 'PUT',
    data
  });
}

export async function deleteQuotaPolicy(id: number) {
  return request(`${QUOTA_POLICIES_API}/${id}`, { method: 'DELETE' });
}
