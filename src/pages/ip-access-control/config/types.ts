export interface ListItem {
  id: number;
  name: string;
  description?: string | null;
  action: string;
  cidr: string;
  priority: number;
  enabled: boolean;
  scope_type: string;
  scope_id: number;
  creator_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface FormData {
  name: string;
  description?: string;
  action: string;
  cidr: string;
  priority: number;
  enabled: boolean;
}

export interface IpAccessPolicy {
  /** Applied when no rule matches the client address. */
  default_action: string;
  /** Master switch; off means nothing is enforced. */
  enabled: boolean;
}

export interface EvaluateResult {
  ip: string;
  allowed: boolean;
  matched_rule_id?: number | null;
  enforcement_enabled: boolean;
  default_action: string;
}
