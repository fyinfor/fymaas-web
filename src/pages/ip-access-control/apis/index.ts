import { request } from '@umijs/max';
import {
  EvaluateResult,
  FormData,
  IpAccessPolicy,
  ListItem
} from '../config/types';

export const IP_ACCESS_RULES_API = '/ip-access-rules';

export async function queryIpAccessRules(params: Global.SearchParams) {
  return request<Global.PageResponse<ListItem>>(IP_ACCESS_RULES_API, {
    method: 'GET',
    params
  });
}

export async function createIpAccessRule(data: FormData) {
  return request<ListItem>(IP_ACCESS_RULES_API, {
    method: 'POST',
    data
  });
}

export async function updateIpAccessRule(id: number, data: Partial<FormData>) {
  return request<ListItem>(`${IP_ACCESS_RULES_API}/${id}`, {
    method: 'PUT',
    data
  });
}

export async function deleteIpAccessRule(id: number) {
  return request(`${IP_ACCESS_RULES_API}/${id}`, {
    method: 'DELETE'
  });
}

export async function queryIpAccessPolicy() {
  return request<IpAccessPolicy>(`${IP_ACCESS_RULES_API}/policy`, {
    method: 'GET'
  });
}

export async function updateIpAccessPolicy(data: IpAccessPolicy) {
  return request<IpAccessPolicy>(`${IP_ACCESS_RULES_API}/policy`, {
    method: 'PUT',
    data
  });
}

/**
 * Dry-run the current rules against one address.
 *
 * Worth having its own endpoint: the cost of a wrong rule here is losing
 * access to the platform, and checking beforehand is far cheaper than
 * recovering afterwards.
 */
export async function evaluateIp(ip: string) {
  return request<EvaluateResult>(`${IP_ACCESS_RULES_API}/evaluate`, {
    method: 'GET',
    params: { ip }
  });
}
