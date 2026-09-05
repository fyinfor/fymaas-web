export type LogKind = 'usage' | 'task';

export type LogStatus = 'completed' | 'interrupted';

export interface ListItem {
  id: number;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  user_id?: number | null;
  user_name?: string | null;
  model_id?: number | null;
  model_name: string;
  model_route_id?: number | null;
  model_route_name?: string | null;
  provider_id?: number | null;
  provider_name?: string | null;
  provider_type?: string | null;
  cluster_id?: number | null;
  cluster_name?: string | null;
  api_key_id?: number | null;
  api_key_name?: string | null;
  access_key?: string | null;
  operation?: string | null;
  prompt_token_count: number;
  completion_token_count: number;
  prompt_cached_token_count: number;
  total_tokens: number;
  ttft_ms?: number | null;
  latency_ms?: number | null;
  completed: boolean;
  status: LogStatus;
}

export interface LogFilters {
  search?: string;
  operation?: string;
  status?: LogStatus;
  model_name?: string;
  user_name?: string;
  api_key_name?: string;
  provider_name?: string;
  start_time?: string;
  end_time?: string;
  scope?: 'self' | 'all';
}

export interface LogStat {
  total: number;
  completed: number;
  interrupted: number;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  total_tokens: number;
  avg_ttft_ms?: number | null;
  avg_latency_ms?: number | null;
}

export interface LogMeta {
  operations: string[];
  models: string[];
  providers: string[];
}
