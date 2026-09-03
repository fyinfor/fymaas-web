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
        redirect: '/settings/system'
      },
      {
        name: 'system',
        path: '/settings/system',
        key: 'system',
        icon: 'icon-settings',
        selectedIcon: 'icon-settings',
        defaultIcon: 'icon-settings',
        access: 'canSeeAdmin',
        component: './settings',
        subMenu: ['/settings/branding', '/settings/ldap']
      },
      {
        name: 'system',
        path: '/settings/branding',
        key: 'branding',
        hideInMenu: true,
        access: 'canSeeAdmin',
        component: './settings'
      },
      {
        name: 'system',
        path: '/settings/ldap',
        key: 'ldap',
        hideInMenu: true,
        access: 'canSeeAdmin',
        component: './settings'
      }
    ]
  }
];

// Enterprise pages that belong inside an existing upstream menu group
// rather than in a new top-level one. Appending here keeps the group's
// definition in `routes.ts` untouched and mergeable.
const groupReplacements: Record<string, Record<string, Partial<RouteLike>>> = {
  '/usage': {
    billing: {
      hideInMenu: false,
      access: 'canSeeBilling',
      component: './enterprise-billing'
    }
  },
  '/access-control': {
    organizations: {
      component: './enterprise-organizations'
    }
  }
};

const groupAdditions: Record<string, RouteLike[]> = {
  '/usage': [
    {
      name: 'quotas',
      path: '/usage/quotas',
      key: 'quotas',
      icon: 'icon-usage-outlined',
      selectedIcon: 'icon-usage-filled',
      defaultIcon: 'icon-usage-outlined',
      access: 'canSeeQuotas',
      component: './quotas'
    }
  ],
  '/resources': [
    {
      name: 'topology',
      path: '/resources/topology',
      key: 'topology',
      icon: 'icon-cluster2-outline',
      selectedIcon: 'icon-cluster2-filled',
      defaultIcon: 'icon-cluster2-outline',
      access: 'canSeeTopology',
      component: './topology'
    },
    {
      name: 'rollouts',
      path: '/resources/rollouts',
      key: 'rollouts',
      icon: 'icon-cluster2-outline',
      selectedIcon: 'icon-cluster2-filled',
      defaultIcon: 'icon-cluster2-outline',
      access: 'canSeeRollouts',
      component: './rollouts'
    }
  ],
  '/access-control': [
    {
      name: 'roles',
      path: '/access-control/roles',
      key: 'roles',
      icon: 'icon-users',
      selectedIcon: 'icon-users-filled',
      defaultIcon: 'icon-users',
      access: 'canSeeRoles',
      component: './roles'
    },
    {
      name: 'ipAccessControl',
      path: '/access-control/ip-access',
      key: 'ipAccessControl',
      icon: 'icon-network',
      selectedIcon: 'icon-network',
      defaultIcon: 'icon-network',
      access: 'canSeeIpAccess',
      component: './ip-access-control'
    },
    {
      name: 'auditLogs',
      path: '/access-control/audit-logs',
      key: 'auditLogs',
      icon: 'icon-list',
      selectedIcon: 'icon-list',
      defaultIcon: 'icon-list',
      // Platform admins and Org owners both read the trail. The backend
      // scopes rows to the caller's organization, so a wider predicate
      // here would not leak anything -- but `canSeeOrgAdmin` is the one
      // that widens to Org owners once the access extension does.
      access: 'canSeeAudit',
      component: './audit-logs'
    }
  ]
};

export const applyRouteExtensions = <T>(base: T): T => {
  if (!Array.isArray(base)) {
    return base;
  }

  const routes = (base as RouteLike[]).map((route) => {
    if (!route?.path || !Array.isArray(route.routes)) {
      return route;
    }
    const replacements = groupReplacements[route.path];
    let nextRoutes = route.routes;
    if (replacements) {
      nextRoutes = nextRoutes.map((child: RouteLike) => {
        const patch = child?.name ? replacements[child.name] : undefined;
        return patch ? { ...child, ...patch } : child;
      });
    }
    const additions = groupAdditions[route.path];
    if (additions) {
      nextRoutes = [...nextRoutes, ...additions];
    }
    return nextRoutes === route.routes
      ? route
      : { ...route, routes: nextRoutes };
  });
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
