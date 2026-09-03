import { StatusType } from '@/config/types';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export const statusTone = (status?: StatusType | string): StatusTone => {
  switch (status) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'danger';
    case 'transitioning':
      return 'info';
    default:
      return 'neutral';
  }
};
