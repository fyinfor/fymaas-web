import { HighlightCode } from '@gpustack/core-ui';
import React, { useMemo } from 'react';
import { generateK8sRegisterCommand } from '../config';
import { resolveWorkerServerUrl } from '../utils/server-url';

type AddModalProps = {
  currentGPU?: string;
  currentGPUs?: string[];
  serverUrl?: string;
  registrationInfo: {
    token: string;
    image: string;
    server_url: string;
    server_lan_url?: string | null;
    cluster_id: number | null;
  };
};
const AddCluster: React.FC<AddModalProps> = ({
  registrationInfo,
  currentGPU,
  currentGPUs,
  serverUrl
}) => {
  const code = useMemo(() => {
    return generateK8sRegisterCommand({
      server: resolveWorkerServerUrl(registrationInfo, serverUrl),
      clusterId: registrationInfo?.cluster_id,
      registrationToken: registrationInfo?.token,
      currentGPU,
      currentGPUs
    });
  }, [registrationInfo, currentGPU, currentGPUs, serverUrl]);

  return (
    <div>
      <HighlightCode
        theme="dark"
        code={code.replace(/\\/g, '')}
        copyValue={code}
        lang="bash"
      ></HighlightCode>
    </div>
  );
};

export default AddCluster;
