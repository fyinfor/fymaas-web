import { createContext } from 'react';
import type { DashboardInfra } from '../hooks/use-dashboard-infra';
import { DashboardProps } from './types';

export type DashboardContextValue = DashboardProps &
  DashboardInfra & {
    fetchData: (params?: { [key: string]: any }) => Promise<void>;
    clusterList?: Global.BaseOption<
      number,
      { provider: string; state: string | number }
    >[];
  };

export const DashboardContext = createContext<DashboardContextValue>(
  {} as DashboardContextValue
);

export default DashboardContext;
