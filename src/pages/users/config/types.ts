export interface FormData {
  username: string;
  id?: number;
  is_admin: boolean | string;
  role_id?: number;
  role_name?: string;
  full_name: string;
  email?: string;
  department?: string;
  organization_id?: number | null;
  organization_name?: string;
  phone?: string;
  password: string;
  is_active?: boolean;
  source?: string;
}

export interface ListItem extends FormData {
  id: number;
  source: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}
