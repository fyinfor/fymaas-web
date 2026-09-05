// Build-time route extensions.
//
// Upstream ships this as an identity function so that its closed-source
// enterprise plugin can overwrite the file during an enterprise build.
// fymaas implements enterprise features in the mainline tree instead, so
// the hook is filled in directly here. Keeping every enterprise route in
// this file is what lets `config/routes.ts` stay identical to upstream,
// and therefore mergeable.

type RouteLike = { path?: string; [key: string]: any };

// Settings pages stay on `/settings/*` so existing links (entry redirect,
// profile dropdown) keep working. The group itself is hidden from the
// sider: system settings is grafted under `/access-control`, and personal
// settings is opened from the avatar menu only.
const enterpriseRoutes: RouteLike[] = [
  {
    name: 'settings',
    path: '/settings',
    key: 'settings',
    hideInMenu: true,
    icon: 'icon-settings',
    selectedIcon: 'icon-settings',
    defaultIcon: 'icon-settings',
    routes: [
      {
        path: '/settings',
        hideInMenu: true,
        component: './settings/entry'
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
        hideInMenu: true,
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
    usage: {
      hideInMenu: true,
      redirect: '/access-control/usage',
      component: undefined
    },
    billing: {
      hideInMenu: true,
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

const USAGE_MENU_ORDER = [
  '/usage/api-keys',
  '/usage/request-logs',
  '/usage/task-logs',
  '/usage/quotas',
  '/usage/billing'
];

const orderUsageRoutes = (children: RouteLike[]): RouteLike[] => {
  const redirects: RouteLike[] = [];
  const rest: RouteLike[] = [];
  children.forEach((child) => {
    if (child.path === '/usage' && child.redirect) {
      redirects.push({ ...child, redirect: '/usage/api-keys' });
      return;
    }
    rest.push(child);
  });
  const rank = (path?: string) => {
    const index = USAGE_MENU_ORDER.indexOf(path || '');
    return index === -1 ? USAGE_MENU_ORDER.length : index;
  };
  rest.sort((left, right) => rank(left.path) - rank(right.path));
  return [...redirects, ...rest];
};

const groupAdditions: Record<string, RouteLike[]> = {
  '/usage': [
    {
      name: 'apikeys',
      path: '/usage/api-keys',
      key: 'apikeys',
      icon: 'icon-key',
      selectedIcon: 'icon-key-filled',
      defaultIcon: 'icon-key',
      component: './api-keys'
    },
    {
      name: 'usageLogs',
      path: '/usage/request-logs',
      key: 'usageLogs',
      icon: 'icon-logs',
      selectedIcon: 'icon-logs',
      defaultIcon: 'icon-logs',
      component: './usage-logs/index'
    },
    {
      name: 'taskLogs',
      path: '/usage/task-logs',
      key: 'taskLogs',
      icon: 'icon-logs',
      selectedIcon: 'icon-logs',
      defaultIcon: 'icon-logs',
      component: './task-logs/index'
    },
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
      name: 'usage',
      path: '/access-control/usage',
      key: 'usageOverview',
      icon: 'icon-usage-outlined',
      selectedIcon: 'icon-usage-filled',
      defaultIcon: 'icon-usage-outlined',
      access: 'canSeeOrgAdmin',
      component: './usage/index'
    },
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
      name: 'messages',
      path: '/access-control/messages',
      key: 'adminMessages',
      icon: 'icon-chat',
      selectedIcon: 'icon-chat-filled',
      defaultIcon: 'icon-chat',
      access: 'canSeeOrgAdmin',
      component: './messages/admin'
    },
    {
      name: 'announcements',
      path: '/access-control/announcements',
      key: 'announcements',
      icon: 'icon-logs',
      selectedIcon: 'icon-logs',
      defaultIcon: 'icon-logs',
      access: 'canSeeOrgAdmin',
      component: './announcements'
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
    },
    {
      // React Router rejects an absolute child path that does not start
      // with its parent's path, and rejecting it takes the whole route
      // tree down (blank page). System settings shows as a row of the
      // access-control group, so it has to live under that prefix; the
      // tabs it renders keep their own `/settings/*` routes, which
      // `subMenu` below maps back onto this row for highlighting.
      name: 'system',
      path: '/access-control/system',
      key: 'systemSettings',
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
    if (route.path === '/usage') {
      nextRoutes = orderUsageRoutes(nextRoutes);
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
    name: 'messages',
    path: '/messages',
    key: 'messages',
    hideInMenu: true,
    component: './messages'
  });
  routes.splice(dashboardIndex === -1 ? 0 : dashboardIndex, 0, {
    name: 'announcementInbox',
    path: '/announcements',
    key: 'announcementInbox',
    hideInMenu: true,
    component: './announcements/inbox'
  });
  routes.splice(dashboardIndex === -1 ? 0 : dashboardIndex, 0, {
    name: 'workspaces',
    path: '/workspaces',
    key: 'workspaces',
    hideInMenu: true,
    access: 'canSeeWorkspaces',
    component: './enterprise-workspaces'
  });

  // Token service sits ahead of model service in the sider.
  const usageIndex = routes.findIndex((route) => route?.path === '/usage');
  const modelsIndex = routes.findIndex((route) => route?.path === '/models');
  if (usageIndex !== -1 && modelsIndex !== -1 && usageIndex !== modelsIndex) {
    const [usageRoute] = routes.splice(usageIndex, 1);
    const insertAt = routes.findIndex((route) => route?.path === '/models');
    routes.splice(insertAt === -1 ? routes.length : insertAt, 0, usageRoute);
  }

  return routes as T;
};
