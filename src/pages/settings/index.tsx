import { history, useAccess, useIntl, useLocation } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import { Tabs, TabsProps } from 'antd';
import { useEffect, useMemo } from 'react';
import IpAccessControl from '../ip-access-control';
import Branding from './branding';
import EnvironmentSettings from './environment';
import LdapSettings from './ldap';
import SystemSettings from './system';

const TabPath = {
  system: '/settings/system',
  environment: '/settings/environment',
  branding: '/settings/branding',
  ldap: '/settings/ldap',
  ipAccess: '/settings/ip-access'
} as const;

type TabKey = keyof typeof TabPath;

const pathToTab = (pathname: string): TabKey => {
  if (pathname.includes('/settings/environment')) {
    return 'environment';
  }
  if (pathname.includes('/settings/branding')) {
    return 'branding';
  }
  if (pathname.includes('/settings/ldap')) {
    return 'ldap';
  }
  if (pathname.includes('/settings/ip-access')) {
    return 'ipAccess';
  }
  return 'system';
};

const Settings: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const location = useLocation();
  const activeKey = pathToTab(location.pathname);

  const handleTabChange = useMemoizedFn((key: string) => {
    const path = TabPath[key as TabKey] || TabPath.system;
    if (path !== location.pathname) {
      history.push(path);
    }
  });

  const items: TabsProps['items'] = useMemo(() => {
    type AccessTab = NonNullable<TabsProps['items']>[number] & {
      access?: string;
    };
    const tabs: AccessTab[] = [
      {
        key: 'system',
        access: 'canSeeAdmin',
        label: intl.formatMessage({ id: 'systemSettings.tab.general' }),
        children: <SystemSettings />
      },
      {
        key: 'environment',
        access: 'canSeeAdmin',
        label: intl.formatMessage({ id: 'systemSettings.tab.environment' }),
        children: <EnvironmentSettings />
      },
      {
        key: 'branding',
        access: 'canSeeAdmin',
        label: intl.formatMessage({ id: 'menu.settings.branding' }),
        children: <Branding />
      },
      {
        key: 'ldap',
        access: 'canSeeAdmin',
        label: intl.formatMessage({ id: 'menu.settings.ldap' }),
        children: <LdapSettings />
      },
      {
        key: 'ipAccess',
        access: 'canSeeIpAccess',
        label: intl.formatMessage({ id: 'menu.accessControl.ipAccessControl' }),
        children: <IpAccessControl />
      }
    ];
    return tabs.filter((item) => {
      if (!item.access) return true;
      return !!(access as Record<string, boolean | undefined>)[item.access];
    });
  }, [access, intl]);

  useEffect(() => {
    const keys = (items || []).map((item) => item?.key).filter(Boolean);
    if (keys.length && !keys.includes(activeKey)) {
      const fallback = TabPath[keys[0] as TabKey] || TabPath.system;
      history.replace(fallback);
    }
  }, [activeKey, items]);

  if (!items?.length) {
    return null;
  }

  if (items.length === 1) {
    return items[0].children;
  }

  return (
    <Tabs
      activeKey={activeKey}
      onChange={handleTabChange}
      items={items}
      destroyOnHidden
      tabBarStyle={{ marginTop: -20 }}
    />
  );
};

Settings.displayName = 'Settings';

export default Settings;
