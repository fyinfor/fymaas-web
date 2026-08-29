import { addWorkerGuide } from '@/pages/resources/config';
import { HighlightCode } from '@gpustack/core-ui';
import React from 'react';
import { resolveWorkerServerUrl } from '../utils/server-url';

type ViewModalProps = {
  currentGPU?: string;
  workerIP?: string;
  modelDir?: string;
  cacheDir?: string;
  containerName?: string;
  gpustackDataVolume?: string;
  advertisAddress?: string;
  dtkVersion?: string;
  serverUrl?: string;
  registrationInfo: {
    token: string;
    image: string;
    server_url: string;
    server_lan_url?: string | null;
    [key: string]: any;
  };
};

const AddWorkerCommand: React.FC<ViewModalProps> = ({
  registrationInfo,
  advertisAddress,
  workerIP,
  modelDir,
  cacheDir,
  currentGPU,
  containerName,
  gpustackDataVolume,
  dtkVersion,
  serverUrl
}) => {
  const code = React.useMemo(() => {
    const commandCode = addWorkerGuide['all'];
    return commandCode
      ?.registerWorker({
        registrationInfo,
        gpu: currentGPU || '',
        server: resolveWorkerServerUrl(registrationInfo, serverUrl),
        tag: '',
        advertisAddress: advertisAddress,
        workerIP: workerIP,
        modelDir: modelDir,
        cacheDir: cacheDir,
        containerName: containerName,
        gpustackDataVolume: gpustackDataVolume,
        dtkVersion: dtkVersion,
        image: registrationInfo.image,
        token: registrationInfo.token || '${token}'
      })
      ?.trim()
      .replace(/\s+$/gm, '')
      .replace(/\\+$/, '');
  }, [
    registrationInfo,
    currentGPU,
    workerIP,
    modelDir,
    cacheDir,
    containerName,
    gpustackDataVolume,
    advertisAddress,
    dtkVersion,
    serverUrl
  ]);

  return (
    <HighlightCode
      theme="dark"
      code={code}
      copyValue={code}
      lang="bash"
      xScrollable={true}
    ></HighlightCode>
  );
};

export default AddWorkerCommand;
