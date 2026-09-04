const PAGE_SUBTITLES: Array<{ prefix: string; id: string }> = [
  { prefix: '/dashboard', id: 'page.subtitle.dashboard' },
  { prefix: '/usage/overview', id: 'page.subtitle.usage' },
  { prefix: '/usage/billing', id: 'page.subtitle.billing' },
  { prefix: '/usage/quotas', id: 'page.subtitle.quotas' },
  { prefix: '/models/user-models', id: 'page.subtitle.userModels' },
  { prefix: '/models/catalog', id: 'page.subtitle.catalog' },
  { prefix: '/models/deployments', id: 'page.subtitle.deployments' },
  { prefix: '/models/routes', id: 'page.subtitle.routes' },
  { prefix: '/models/providers', id: 'page.subtitle.providers' },
  { prefix: '/models/benchmark', id: 'page.subtitle.benchmark' },
  { prefix: '/models/backends', id: 'page.subtitle.backends' },
  { prefix: '/models/kv-cache', id: 'page.subtitle.kvCache' },
  { prefix: '/models/modelfiles', id: 'page.subtitle.modelfiles' },
  { prefix: '/gpu-service/instances', id: 'page.subtitle.gpuInstances' },
  { prefix: '/gpu-service/instance-types', id: 'page.subtitle.instanceTypes' },
  { prefix: '/gpu-service/templates', id: 'page.subtitle.templates' },
  { prefix: '/gpu-service/storage-types', id: 'page.subtitle.storageTypes' },
  { prefix: '/gpu-service/storage', id: 'page.subtitle.storage' },
  { prefix: '/gpu-service/public-keys', id: 'page.subtitle.sshKeys' },
  { prefix: '/resources/clusters', id: 'page.subtitle.clusters' },
  { prefix: '/resources/workers', id: 'page.subtitle.workers' },
  { prefix: '/resources/gpus', id: 'page.subtitle.gpus' },
  { prefix: '/resources/credentials', id: 'page.subtitle.credentials' },
  { prefix: '/resources/topology', id: 'page.subtitle.topology' },
  { prefix: '/resources/rollouts', id: 'page.subtitle.rollouts' },
  { prefix: '/settings', id: 'page.subtitle.settings' },
  { prefix: '/access-control/users', id: 'page.subtitle.users' },
  { prefix: '/access-control/api-keys', id: 'page.subtitle.apikeys' },
  { prefix: '/access-control/roles', id: 'page.subtitle.roles' },
  { prefix: '/access-control/permissions', id: 'page.subtitle.roles' },
  { prefix: '/access-control/audit-logs', id: 'page.subtitle.audit' },
  { prefix: '/playground', id: 'page.subtitle.playground' }
];

export const getPageSubtitleId = (pathname: string) => {
  const path = pathname.split('?')[0];
  const match = PAGE_SUBTITLES.find((item) => path.startsWith(item.prefix));
  return match?.id;
};
