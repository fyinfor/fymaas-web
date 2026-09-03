export interface ListItem {
  id: number;
  name: string;
  description?: string | null;
  enabled: boolean;
  subject_type: string;
  subject_principal_id: number;
  api_key_id: number;
  target_type: string;
  target_id: number;
  token_quota?: number | null;
  quota_period: string;
  token_rate_limit?: number | null;
  token_rate_window_seconds: number;
  request_rate_limit?: number | null;
  request_rate_window_seconds: number;
  alert_threshold_percent: number;
  notification_channel_id?: number | null;
  used_tokens: number;
  used_percent?: number | null;
  created_at: string;
  updated_at: string;
}

export interface FormData {
  name: string;
  description?: string;
  enabled: boolean;
  subject_type: string;
  subject_principal_id?: number;
  api_key_id?: number;
  target_type: string;
  target_id?: number;
  token_quota?: number;
  quota_period: string;
  token_rate_limit?: number;
  token_rate_window_seconds?: number;
  request_rate_limit?: number;
  request_rate_window_seconds?: number;
  alert_threshold_percent: number;
  notification_channel_id?: number;
}

export interface ChannelItem {
  id: number;
  name: string;
  channel_type: string;
  enabled: boolean;
  webhook_url?: string | null;
  email_to?: string | null;
}

export interface ChannelForm {
  name: string;
  channel_type: string;
  enabled: boolean;
  webhook_url?: string;
  email_to?: string;
}
