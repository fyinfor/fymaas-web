// Build-time route extensions.
//
// Upstream ships this as an identity function so that its closed-source
// enterprise plugin can overwrite the file during an enterprise build.
// fymaas implements enterprise features in the mainline tree instead, so
// the hook is filled in directly here. Keeping every enterprise route in
// this file is what lets `config/routes.ts` stay identical to upstream,
// and therefore mergeable.

type RouteLike = { path?: string; [key: string]: any };

const enterpriseRoutes: RouteLike[] = [
  {
    name: 'settings',
    path: '/settings',
    key: 'settings',
    icon: 'icon-settings',
    selectedIcon: 'icon-settings',
    defaultIcon: 'icon-settings',
    access: 'canSeeAdmin',
    routes: [
      {
        path: '/settings',
        redirect: '/settings/branding'
      },
      {
        name: 'branding',
        path: '/settings/branding',
        key: 'branding',
        access: 'canSeeAdmin',
        component: './settings/branding'
      }
    ]
  }
];

export const applyRouteExtensions = <T>(base: T): T => {
  if (!Array.isArray(base)) {
    return base;
  }

  const routes = [...(base as RouteLike[])];
  // The catch-all 404 must stay last, so enterprise entries are spliced
  // in ahead of it rather than appended.
  const catchAllIndex = routes.findIndex((route) => route?.path === '*');
  routes.splice(
    catchAllIndex === -1 ? routes.length : catchAllIndex,
    0,
    ...enterpriseRoutes
  );

  return routes as T;
};
