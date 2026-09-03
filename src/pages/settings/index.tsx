import { history, useIntl, useLocation } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import { Tabs, TabsProps } from 'antd';
import { useMemo } from 'react';
import Branding from './branding';
import LdapSettings from './ldap';
import SystemSettings from './system';

const TabPath = {
  system: '/settings/system',
  branding: '/settings/branding',
  ldap: '/settings/ldap'
} as const;

type TabKey = keyof typeof TabPath;

const pathToTab = (pathname: string): TabKey => {
  if (pathname.includes('/settings/branding')) {
    return 'branding';
  }
  if (pathname.includes('/settings/ldap')) {
    return 'ldap';
  }
  return 'system';
};

const Settings: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const activeKey = pathToTab(location.pathname);

  const handleTabChange = useMemoizedFn((key: string) => {
    const path = TabPath[key as TabKey] || TabPath.system;
    if (path !== location.pathname) {
      history.push(path);
    }
  });

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'system',
        label: intl.formatMessage({ id: 'systemSettings.tab.general' }),
        children: <SystemSettings />
      },
      {
        key: 'branding',
        label: intl.formatMessage({ id: 'menu.settings.branding' }),
        children: <Branding />
      },
      {
        key: 'ldap',
        label: intl.formatMessage({ id: 'menu.settings.ldap' }),
        children: <LdapSettings />
      }
    ],
    [intl]
  );

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
