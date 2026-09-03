import { queryWorkersList } from '@/pages/resources/apis';
import { WorkerStatusMap } from '@/pages/resources/config';
import type { GPUDeviceItem, ListItem } from '@/pages/resources/config/types';
import { useEffect, useMemo, useState } from 'react';
import { DashboardProps } from '../config/types';
import { historyValues, sumHistory } from '../utils/format';

export interface DashboardInfra {
  workers: ListItem[];
  gpus: GPUDeviceItem[];
  readyWorkers: number;
  totalWorkers: number;
  gpuInUse: number;
  gpuReady: number;
  gpuTotal: number;
  vramUsed: number;
  vramTotal: number;
  gpuAllocated: number;
  requestVolume: number;
  tokenVolume: number;
  requestHistory: number[];
  gpuHistory: number[];
  vramHistory: number[];
  replicaHistory: number[];
  clusterHealthy: boolean;
  primaryGpuName: string;
}

const emptyInfra: DashboardInfra = {
  workers: [],
  gpus: [],
  readyWorkers: 0,
  totalWorkers: 0,
  gpuInUse: 0,
  gpuReady: 0,
  gpuTotal: 0,
  vramUsed: 0,
  vramTotal: 0,
  gpuAllocated: 0,
  requestVolume: 0,
  tokenVolume: 0,
  requestHistory: [],
  gpuHistory: [],
  vramHistory: [],
  replicaHistory: [],
  clusterHealthy: true,
  primaryGpuName: ''
};

const isGpuBusy = (gpu: GPUDeviceItem) => {
  return (
    Number(gpu.memory?.allocated || 0) > 0 ||
    Number(gpu.core?.utilization_rate || 0) > 1
  );
};

export default function useDashboardInfra(data?: Partial<DashboardProps>) {
  const [workers, setWorkers] = useState<ListItem[]>([]);

  useEffect(() => {
    let mounted = true;
    queryWorkersList({ page: -1 })
      .then((res) => {
        if (mounted) {
          setWorkers(res?.items || []);
        }
      })
      .catch(() => {
        if (mounted) {
          setWorkers([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return useMemo<DashboardInfra>(() => {
    const gpus = workers.flatMap((worker) => worker.status?.gpu_devices || []);
    const readyWorkers = workers.filter(
      (worker) => worker.state === WorkerStatusMap.ready
    ).length;
    const gpuInUse = gpus.filter(isGpuBusy).length;
    const gpuReady = workers
      .filter((worker) => worker.state === WorkerStatusMap.ready)
      .reduce(
        (sum, worker) => sum + (worker.status?.gpu_devices?.length || 0),
        0
      );
    const vramUsed = gpus.reduce(
      (sum, gpu) => sum + Number(gpu.memory?.used || 0),
      0
    );
    const vramTotal = gpus.reduce(
      (sum, gpu) => sum + Number(gpu.memory?.total || 0),
      0
    );
    const gpuAllocated = gpus.reduce(
      (sum, gpu) => sum + Number(gpu.memory?.allocated || 0),
      0
    );
    const nameCount = new Map<string, number>();
    gpus.forEach((gpu) => {
      const name = gpu.name || '';
      if (!name) return;
      nameCount.set(name, (nameCount.get(name) || 0) + 1);
    });
    const primaryGpuName =
      Array.from(nameCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const requestHistory = historyValues(
      data?.model_usage?.api_request_history
    );
    const tokenVolume =
      sumHistory(data?.model_usage?.prompt_token_history) +
      sumHistory(data?.model_usage?.completion_token_history);

    const unhealthy = workers.some(
      (worker) =>
        worker.state === WorkerStatusMap.error ||
        worker.state === WorkerStatusMap.not_ready ||
        worker.state === WorkerStatusMap.unreachable
    );

    return {
      ...emptyInfra,
      workers,
      gpus,
      readyWorkers,
      totalWorkers:
        workers.length || Number(data?.resource_counts?.worker_count || 0),
      gpuInUse,
      gpuReady: gpuReady || gpus.length,
      gpuTotal: gpus.length || Number(data?.resource_counts?.gpu_count || 0),
      vramUsed,
      vramTotal,
      gpuAllocated,
      requestVolume: sumHistory(data?.model_usage?.api_request_history),
      tokenVolume,
      requestHistory,
      gpuHistory: historyValues(data?.system_load?.history?.gpu),
      vramHistory: historyValues(data?.system_load?.history?.vram),
      replicaHistory: requestHistory,
      clusterHealthy: workers.length ? !unhealthy : true,
      primaryGpuName
    };
  }, [data, workers]);
}
