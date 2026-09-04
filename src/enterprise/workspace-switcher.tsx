import {
  CaretDownOutlined,
  CheckOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { IconFont } from '@gpustack/core-ui';
import { nsLocal } from '@gpustack/core-ui/utils';
import { request, useAccess, useIntl } from '@umijs/max';
import { Dropdown, Tooltip } from 'antd';
import React from 'react';
import CreateWorkspaceModal from './create-workspace-modal';
import { subscribeWorkspaceListChanged } from './workspace-events';

export type MyWorkspaceItem = {
  workspace: {
    id: number;
    name?: string;
    display_name?: string;
    is_personal?: boolean;
    is_default?: boolean;
    organization_id?: number;
    organization?: { id: number; name?: string; display_name?: string };
  };
  role?: string;
  org_role?: string;
};

export const WORKSPACES_PATH = '/workspaces';
export { notifyWorkspaceListChanged } from './workspace-events';

export const persistWorkspaceSelection = (id: number | null) => {
  if (id == null) {
    nsLocal.remove('currentWorkspaceId');
    nsLocal.remove('currentOrganizationId');
    return;
  }
  nsLocal.set('currentWorkspaceId', JSON.stringify(id));
  nsLocal.set('currentOrganizationId', JSON.stringify(id));
};

export const readCurrentWorkspaceId = (): number | null => {
  try {
    const raw =
      nsLocal.get('currentWorkspaceId') || nsLocal.get('currentOrganizationId');
    if (!raw) return null;
    const value = JSON.parse(raw);
    return typeof value === 'number' ? value : null;
  } catch {
    return null;
  }
};

export const cacheWorkspaces = (rows: MyWorkspaceItem[]) => {
  nsLocal.set(
    'workspaceList',
    JSON.stringify(
      rows.map((item) => ({
        id: item.workspace?.id,
        name: item.workspace?.organization?.name || item.workspace?.name,
        org_name: item.workspace?.organization?.name,
        organization: item.workspace?.organization,
        role: item.role,
        org_role: item.org_role,
        is_personal: item.workspace?.is_personal,
        is_default: item.workspace?.is_default,
        display_name: item.workspace?.display_name
      }))
    )
  );
};

const isOrgWorkspace = (item: MyWorkspaceItem) =>
  !!item.workspace?.id && !item.workspace?.is_personal;

export async function loadMyWorkspaces(): Promise<MyWorkspaceItem[]> {
  const rows = await request('/users/me/workspaces', {
    skipErrorHandler: true
  });
  if (!Array.isArray(rows)) return [];
  return rows.filter(isOrgWorkspace);
}

export const pickDefaultWorkspaceId = (
  rows: MyWorkspaceItem[]
): number | null => {
  const marked = rows.find((item) => item.workspace?.is_default)?.workspace?.id;
  if (typeof marked === 'number') return marked;
  const named = rows.find(
    (item) =>
      item.workspace?.name === 'default' ||
      item.workspace?.display_name === 'Default'
  )?.workspace?.id;
  if (typeof named === 'number') return named;
  return rows[0]?.workspace?.id ?? null;
};

/** First visit, 「全部」, or a personal slot: land on the default workspace. */
export const ensureDefaultWorkspaceSelection = (
  rows: MyWorkspaceItem[]
): boolean => {
  const current = readCurrentWorkspaceId();
  const valid = new Set(
    rows
      .map((item) => item.workspace?.id)
      .filter((id): id is number => typeof id === 'number')
  );
  if (current != null && valid.has(current)) return false;
  const id = pickDefaultWorkspaceId(rows);
  if (id == null) return false;
  persistWorkspaceSelection(id);
  return true;
};

type IntlLike = {
  formatMessage: (desc: { id: string; defaultMessage?: string }) => string;
};

const isStockDefaultName = (value?: string) => /^default$/i.test(value || '');

export const formatWorkspaceName = (
  ws: { name?: string; display_name?: string; id?: number },
  intl: IntlLike
): string => {
  if (isStockDefaultName(ws.display_name) || isStockDefaultName(ws.name)) {
    return intl.formatMessage({
      id: 'workspaces.name.default',
      defaultMessage: 'Default workspace'
    });
  }
  return ws.display_name || ws.name || String(ws.id ?? '');
};

export const workspaceLabel = (item: MyWorkspaceItem, intl: IntlLike): string =>
  formatWorkspaceName(item.workspace, intl);

/** Persist the selection then reload so tenant headers apply. */
export const enterWorkspace = (id: number, path?: string) => {
  persistWorkspaceSelection(id);
  const next = path || window.location.hash.replace(/^#/, '') || '/dashboard';
  const hash = next.startsWith('#') ? next : `#${next}`;
  if (window.location.hash === hash) {
    window.location.reload();
    return;
  }
  window.location.hash = hash;
  window.location.reload();
};

const useWorkspaceList = () => {
  const [items, setItems] = React.useState<MyWorkspaceItem[]>([]);
  const [current, setCurrent] = React.useState<number | null>(() =>
    readCurrentWorkspaceId()
  );
  const refresh = React.useCallback(async () => {
    const rows = await loadMyWorkspaces();
    setItems(rows);
    cacheWorkspaces(rows);
    const applied = ensureDefaultWorkspaceSelection(rows);
    setCurrent(readCurrentWorkspaceId());
    if (applied) {
      window.location.reload();
    }
    return rows;
  }, []);
  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);
  React.useEffect(() => {
    const onChange = () => {
      refresh().catch(() => undefined);
    };
    return subscribeWorkspaceListChanged(onChange);
  }, [refresh]);
  return { items, current, refresh };
};

/** Compact Select used in the top-bar slot (kept for compatibility). */
const HeaderWorkspaceSwitcher: React.FC = () => {
  return <SidebarWorkspaceSwitcher collapsed={false} variant="header" />;
};

type SidebarProps = {
  collapsed?: boolean;
  context?: { collapsed?: boolean };
  variant?: 'sidebar' | 'header';
};

export const SidebarWorkspaceSwitcher: React.FC<SidebarProps> = (props) => {
  const intl = useIntl();
  const access = useAccess();
  const { items, current, refresh } = useWorkspaceList();
  const collapsed = !!(props.collapsed ?? props.context?.collapsed);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const singleWorkspace = items.length <= 1;

  const currentItem = items.find((item) => item.workspace?.id === current);
  const currentName = currentItem
    ? workspaceLabel(currentItem, intl)
    : items[0]
      ? workspaceLabel(items[0], intl)
      : '';

  const pick = (key: string) => {
    setMenuOpen(false);
    if (key === 'manage') {
      window.location.hash = `#${WORKSPACES_PATH}`;
      return;
    }
    if (key === 'create') {
      setCreateOpen(true);
      return;
    }
    const id = Number(key);
    if (Number.isFinite(id) && id !== current) {
      enterWorkspace(id);
    }
  };

  if (!items.length && !access.canSeeAdmin) {
    return null;
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '6px 10px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 13,
    color: 'inherit'
  };

  const overlay = (
    <div
      style={{
        minWidth: 240,
        padding: 4,
        background:
          'var(--console-bg-elevated, var(--ant-color-bg-elevated, #fff))',
        border: '1px solid var(--console-border, var(--ant-color-border))',
        borderRadius: 8,
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
      }}
    >
      {!singleWorkspace &&
        items.map((item) => {
          const ws = item.workspace;
          const selected = current === ws.id;
          return (
            <button
              type="button"
              key={ws.id}
              style={rowStyle}
              onClick={() => pick(String(ws.id))}
            >
              <span style={{ width: 14 }}>
                {selected ? <CheckOutlined /> : null}
              </span>
              {workspaceLabel(item, intl)}
            </button>
          );
        })}
      {!singleWorkspace && (
        <div
          style={{
            height: 1,
            margin: '4px 0',
            background: 'var(--console-border, var(--ant-color-split))'
          }}
        />
      )}
      <button type="button" style={rowStyle} onClick={() => pick('manage')}>
        <SettingOutlined />
        {intl.formatMessage({
          id: 'workspaces.switcher.manage',
          defaultMessage: 'Manage workspaces'
        })}
      </button>
      {access.canSeeWorkspaces && (
        <button type="button" style={rowStyle} onClick={() => pick('create')}>
          <PlusOutlined />
          {intl.formatMessage({
            id: 'workspaces.switcher.create',
            defaultMessage: 'New workspace'
          })}
        </button>
      )}
    </div>
  );

  const trigger = (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        height: 36,
        padding: '0 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        border: '1px solid var(--console-border, var(--ant-color-border))',
        borderRadius: 6,
        background: 'var(--console-bg-page, transparent)',
        color: 'var(--console-text, inherit)',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      <IconFont
        type="icon-org-outlined"
        style={{ fontSize: 16, flexShrink: 0 }}
      />
      {!collapsed && (
        <>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              fontSize: 13
            }}
          >
            {currentName}
          </span>
          {!singleWorkspace && (
            <CaretDownOutlined
              style={{ fontSize: 10, opacity: 0.65, flexShrink: 0 }}
            />
          )}
        </>
      )}
    </button>
  );

  return (
    <div style={{ padding: collapsed ? '8px 8px 4px' : '8px 8px 8px 0' }}>
      <Dropdown
        trigger={['click']}
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (open) {
            refresh().catch(() => undefined);
          }
        }}
        popupRender={() => overlay}
        placement="bottomLeft"
        getPopupContainer={() => document.body}
      >
        {collapsed ? (
          <Tooltip title={currentName} placement="right">
            {trigger}
          </Tooltip>
        ) : (
          trigger
        )}
      </Dropdown>
      <CreateWorkspaceModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onCreated={() => {
          refresh().catch(() => undefined);
        }}
      />
    </div>
  );
};

const WorkspaceSwitcher: React.FC<{
  isDarkTheme?: boolean;
  collapsed?: boolean;
}> = (props) => {
  if (props.collapsed != null) {
    return <SidebarWorkspaceSwitcher collapsed={props.collapsed} />;
  }
  return <HeaderWorkspaceSwitcher />;
};

export default WorkspaceSwitcher;
