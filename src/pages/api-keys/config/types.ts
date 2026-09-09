export interface ListItem {
  name: string;
  description: string;
  id: number;
  value?: string;
  masked_value?: string;
  user_id?: number;
  user_name?: string;
  // The owning principal — an Org, or a USER principal for a
  // personal-scope key, or NULL for an admin "All" mode key (no
  // tenant pinning).
  owner_principal_id?: number | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  allowed_model_names: string[];
  custom?: string;
  scope?: string[];
  is_custom?: boolean;
}

export interface FormData {
  name: string;
  allowed_type: 'all' | 'custom' | 'management';
  description: string;
  allowed_model_names: string[];
  expires_at?: any;
  expires_never?: boolean;
  scope?: string[];
}
