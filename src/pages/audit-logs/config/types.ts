export interface ListItem {
  id: number;
  occurred_at: string;
  actor_principal_id?: number | null;
  actor_name?: string | null;
  actor_type?: string | null;
  api_key_id?: number | null;
  api_key_name?: string | null;
  org_principal_id?: number | null;
  org_name?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  resource_name?: string | null;
  http_method?: string | null;
  http_path?: string | null;
  http_status?: number | null;
  source_ip?: string | null;
  user_agent?: string | null;
  request_id?: string | null;
  /** Request payload with credentials redacted server-side. */
  changes?: Record<string, any> | null;
  result: string;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogFilters {
  action?: string;
  actor_principal_id?: number;
  resource_type?: string;
  result?: string;
  start_time?: string;
  end_time?: string;
  search?: string;
}
