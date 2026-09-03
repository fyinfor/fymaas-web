import { request } from '@umijs/max';
import {
  EvaluateResult,
  FormData,
  IpAccessPolicy,
  IpScope,
  ListItem
} from '../config/types';

export const IP_ACCESS_RULES_API = '/ip-access-rules';

const isOrg = (scope: IpScope) => scope.kind === 'org';

const scopeParams = (scope: IpScope) => {
  if (isOrg(scope) || scope.kind === 'platform') {
    return {};
  }
  return {
    scope_type: scope.kind,
    scope_id: scope.scopeId
  };
};

const prefix = (scope: IpScope) =>
  isOrg(scope) ? `${IP_ACCESS_RULES_API}/org` : IP_ACCESS_RULES_API;

export async function queryIpAccessRules(
  params: Global.SearchParams,
  scope: IpScope
) {
  return request<Global.PageResponse<ListItem>>(prefix(scope), {
    method: 'GET',
    params: { ...params, ...scopeParams(scope) }
  });
}

export async function createIpAccessRule(data: FormData, scope: IpScope) {
  const payload = isOrg(scope)
    ? data
    : {
        ...data,
        scope_type: scope.kind,
        scope_id: scope.kind === 'platform' ? 0 : scope.scopeId
      };
  return request<ListItem>(prefix(scope), { method: 'POST', data: payload });
}

export async function updateIpAccessRule(
  id: number,
  data: Partial<FormData>,
  scope: IpScope
) {
  return request<ListItem>(`${prefix(scope)}/${id}`, {
    method: 'PUT',
    data
  });
}

export async function deleteIpAccessRule(id: number, scope: IpScope) {
  return request(`${prefix(scope)}/${id}`, { method: 'DELETE' });
}

export async function queryIpAccessPolicy(scope: IpScope) {
  return request<IpAccessPolicy>(`${prefix(scope)}/policy`, {
    method: 'GET',
    params: scopeParams(scope)
  });
}

export async function updateIpAccessPolicy(
  data: IpAccessPolicy,
  scope: IpScope
) {
  return request<IpAccessPolicy>(`${prefix(scope)}/policy`, {
    method: 'PUT',
    data,
    params: scopeParams(scope)
  });
}

export async function evaluateIp(ip: string, scope: IpScope) {
  return request<EvaluateResult>(`${prefix(scope)}/evaluate`, {
    method: 'GET',
    params: { ip, ...scopeParams(scope) }
  });
}
