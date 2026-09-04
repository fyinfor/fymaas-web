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
    routes: [
      {
        path: '/settings',
        component: './settings/entry'
      },
      {
        name: 'system',
        path: '/settings/system',
        key: 'system',
        icon: 'icon-settings',
        selectedIcon: 'icon-settings',
        defaultIcon: 'icon-settings',
        access: 'canSeeIpAccess',
        component: './settings',
        subMenu: [
          '/settings/environment',
          '/settings/branding',
          '/settings/ldap',
          '/settings/ip-access'
        ]
      },
      {
        name: 'system',
        path: '/settings/environment',
        key: 'environment',
        hideInMenu: true,
        access: 'canSeeAdmin',
        component: './settings'
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
      },
      {
        name: 'system',
        path: '/settings/ip-access',
        key: 'ipAccess',
        hideInMenu: true,
        access: 'canSeeIpAccess',
        component: './settings'
      },
      {
        name: 'profile',
        path: '/settings/profile',
        key: 'profile',
        icon: 'icon-preferences',
        selectedIcon: 'icon-preferences',
        defaultIcon: 'icon-preferences',
        component: './profile'
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
    },
    apikeys: {
      hideInMenu: true,
      redirect: '/usage/api-keys',
      component: undefined
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
    },
    {
      name: 'apikeys',
      path: '/usage/api-keys',
      key: 'apikeys',
      icon: 'icon-key',
      selectedIcon: 'icon-key-filled',
      defaultIcon: 'icon-key',
      component: './api-keys'
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
      path: '/access-control/permissions',
      hideInMenu: true,
      access: 'canSeeRoles',
      redirect: '/access-control/roles'
    },
    {
      path: '/access-control/ip-access',
      hideInMenu: true,
      access: 'canSeeIpAccess',
      redirect: '/settings/ip-access'
    },
    {
      path: '/access-control/workspaces',
      hideInMenu: true,
      access: 'canSeeWorkspaces',
      redirect: '/workspaces'
    },
    {
      name: 'auditLogs',
      path: '/access-control/audit-logs',
      key: 'auditLogs',
      icon: 'icon-logs',
      selectedIcon: 'icon-logs',
      defaultIcon: 'icon-logs',
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
    if (route?.path === '/api-keys') {
      const { component: _apiKeysComponent, ...rest } = route;
      return {
        ...rest,
        redirect: '/usage/api-keys',
        hideInMenu: true
      };
    }
    if (route?.path === '/preferences') {
      const { component: _component, ...rest } = route;
      return {
        ...rest,
        redirect: '/settings/profile',
        hideInMenu: true
      };
    }
    if (route?.path === '/api-keys') {
      const { component: _component, ...rest } = route;
      return {
        ...rest,
        redirect: '/usage/api-keys',
        hideInMenu: true
      };
    }
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

  // Workspaces are opened from the switcher ("Manage workspaces"),
  // not as a sider row.
  const dashboardIndex = routes.findIndex(
    (route) => route?.path === '/dashboard'
  );
  routes.splice(dashboardIndex === -1 ? 0 : dashboardIndex, 0, {
    name: 'workspaces',
    path: '/workspaces',
    key: 'workspaces',
    hideInMenu: true,
    access: 'canSeeWorkspaces',
    component: './enterprise-workspaces'
  });

  return routes as T;
};
