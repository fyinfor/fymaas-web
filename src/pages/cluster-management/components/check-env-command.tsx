import { addWorkerGuide } from '@/pages/resources/config';
import { HighlightCode } from '@gpustack/core-ui';
import React from 'react';
import { ProviderType, ProviderValueMap } from '../config';

// Probe kube-apiserver, not /readyz — fymaas serves /readyz on :8080, which is
// also kubectl's default when kubeconfig is missing.
const K8S_CLUSTER_CHECK =
  'kubectl get --raw=/api/v1 >/dev/null 2>&1 && echo "Kubernetes cluster OK" || (echo "Kubernetes not available. Install a cluster and configure kubeconfig."; exit 1)';

// CPU-only (no GPU vendor selected) check for Kubernetes: verify at least one
// ready node exists in the target cluster.
const K8S_CPU_ONLY_CHECK =
  'kubectl get nodes -o jsonpath=\'{.items[*].status.conditions[?(@.type=="Ready")].status}\' 2>/dev/null | grep -q "True" && echo "Ready nodes found. You are registering a CPU-only cluster." || (echo "No ready nodes found"; exit 1)';

type ViewModalProps = {
  provider: ProviderType;
  currentGPU: string;
  // When multiple vendors are selected (K8s multi-vendor register flow),
  // we emit one check command per vendor so the user can verify each
  // runtimeclass is registered.
  currentGPUs?: string[];
};

const AddWorkerCommand: React.FC<ViewModalProps> = ({
  provider = '',
  currentGPU,
  currentGPUs
}) => {
  const code = React.useMemo(() => {
    const configs = addWorkerGuide['all'];
    const keys =
      currentGPUs && currentGPUs.length > 0
        ? currentGPUs
        : currentGPU
          ? [currentGPU]
          : [];

    // CPU-only K8s flow: no GPU vendor selected, check for ready nodes instead.
    if (!keys.length && provider === ProviderValueMap.Kubernetes) {
      return `${K8S_CLUSTER_CHECK}\n${K8S_CPU_ONLY_CHECK}`;
    }

    if (!keys.length) return '';
    const lines = keys
      .map((k) => configs.checkEnvCommand(k)?.[provider || ''])
      .filter((cmd): cmd is string => !!cmd);
    if (provider === ProviderValueMap.Kubernetes && lines.length) {
      return [K8S_CLUSTER_CHECK, ...lines].join('\n');
    }
    return lines.join('\n');
  }, [provider, currentGPU, currentGPUs]);

  return (
    <HighlightCode
      theme="dark"
      code={code}
      copyValue={code}
      lang="bash"
    ></HighlightCode>
  );
};

export default AddWorkerCommand;
