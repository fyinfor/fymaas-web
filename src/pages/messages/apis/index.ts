import { request } from '@umijs/max';

export type MessageThread = {
  id: number;
  title: string;
  user_id: number;
  user_username?: string | null;
  unread_for_user: number;
  unread_for_admin: number;
  last_message?: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageEntry = {
  id: number;
  thread_id: number;
  sender_user_id: number;
  body: string;
  created_at: string;
};

export type MessageThreadDetail = {
  thread: MessageThread;
  data: MessageEntry[];
};

export type UnreadCount = {
  unread: number;
  messages?: number;
  announcements?: number;
};

const userBase = '/site-messages';
const adminBase = '/admin-site-messages';

const base = (admin: boolean) => (admin ? adminBase : userBase);

export async function queryUnreadCount(admin = false) {
  return request<UnreadCount>(`${base(admin)}/unread-count`, { method: 'GET' });
}

export async function queryThreads(
  admin = false,
  params?: Global.SearchParams
) {
  return request<Global.PageResponse<MessageThread>>(`${base(admin)}/threads`, {
    method: 'GET',
    params: { page: 1, perPage: 100, ...params }
  });
}

export async function createThread(data: { title: string; body: string }) {
  return request<MessageThread>(`${userBase}/threads`, {
    method: 'POST',
    data
  });
}

export async function queryThread(id: number, admin = false) {
  return request<MessageThreadDetail>(`${base(admin)}/threads/${id}`, {
    method: 'GET'
  });
}

export async function replyThread(id: number, body: string, admin = false) {
  return request<MessageEntry>(`${base(admin)}/threads/${id}/messages`, {
    method: 'POST',
    data: { body }
  });
}

export async function markThreadRead(id: number, admin = false) {
  return request(`${base(admin)}/threads/${id}/read`, { method: 'POST' });
}
