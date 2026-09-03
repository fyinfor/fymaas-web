import { request } from '@umijs/max';
import { ChannelForm, ChannelItem, FormData, ListItem } from '../config/types';

export const QUOTA_POLICIES_API = '/quota-policies';
export const NOTIFICATION_CHANNELS_API = '/notification-channels';

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

export async function queryNotificationChannels(params?: Global.SearchParams) {
  return request<Global.PageResponse<ChannelItem>>(NOTIFICATION_CHANNELS_API, {
    method: 'GET',
    params: params || { page: 1, perPage: 100 }
  });
}

export async function createNotificationChannel(data: ChannelForm) {
  return request<ChannelItem>(NOTIFICATION_CHANNELS_API, {
    method: 'POST',
    data
  });
}

export async function deleteNotificationChannel(id: number) {
  return request(`${NOTIFICATION_CHANNELS_API}/${id}`, { method: 'DELETE' });
}
