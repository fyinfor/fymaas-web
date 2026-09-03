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
  subject_principal_id: number;
  target_type: string;
  token_quota?: number;
  quota_period: string;
  request_rate_limit?: number;
  alert_threshold_percent: number;
}
