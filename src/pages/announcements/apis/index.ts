import { request } from '@umijs/max';

export type AnnouncementItem = {
  id: number;
  title: string;
  body: string;
  published: boolean;
  published_at?: string | null;
  unread?: boolean;
  created_at: string;
  updated_at: string;
};

export type UnreadCount = {
  unread: number;
  announcements?: number;
};

export async function queryPublishedAnnouncements() {
  return request<Global.PageResponse<AnnouncementItem>>('/announcements', {
    method: 'GET',
    params: { page: 1, perPage: 50 }
  });
}

export async function queryAnnouncementUnread() {
  return request<UnreadCount>('/announcements/unread-count', { method: 'GET' });
}

export async function markAnnouncementRead(id: number) {
  return request(`/announcements/${id}/read`, { method: 'POST' });
}

export async function queryAdminAnnouncements(params?: Global.SearchParams) {
  return request<Global.PageResponse<AnnouncementItem>>(
    '/admin-announcements',
    {
      method: 'GET',
      params
    }
  );
}

export async function createAnnouncement(data: {
  title: string;
  body: string;
  published: boolean;
}) {
  return request<AnnouncementItem>('/admin-announcements', {
    method: 'POST',
    data
  });
}

export async function updateAnnouncement(
  id: number,
  data: Partial<{ title: string; body: string; published: boolean }>
) {
  return request<AnnouncementItem>(`/admin-announcements/${id}`, {
    method: 'PUT',
    data
  });
}

export async function deleteAnnouncement(id: number, _opts?: unknown) {
  return request(`/admin-announcements/${id}`, { method: 'DELETE' });
}
