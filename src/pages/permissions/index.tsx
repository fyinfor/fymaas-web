import { useAccess, useIntl } from '@umijs/max';
import { Checkbox, Input, Space, Table, Tag, Typography, message } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import PageBox from '../_components/page-box';
import {
  patchRolePermission,
  queryPermissionCatalog,
  queryRoles,
  type PermissionItem,
  type RoleItem
} from './apis';

const useStyles = createStyles(({ css }) => ({
  description: css`
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 20px;
    color: var(--ant-color-text-tertiary);
  `,
  group: css`
    font-weight: 600;
    color: var(--ant-color-text);
  `,
  key: css`
    font-family: var(--console-font-numeric, ui-monospace, monospace);
    font-size: 12px;
  `,
  hint: css`
    font-size: 12px;
    color: var(--ant-color-text-tertiary);
  `
}));

type CatalogRow =
  | { rowKey: string; isGroup: true; group: string }
  | {
      rowKey: string;
      isGroup: false;
      group: string;
      key: string;
      description: string;
    };

const Permissions: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const { styles } = useStyles();
  const canWrite = !!(access.canSeeAdmin || access.canManageCurrentOrg);
  const [catalog, setCatalog] = React.useState<PermissionItem[]>([]);
  const [roles, setRoles] = React.useState<RoleItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [pending, setPending] = React.useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [items, page] = await Promise.all([
        queryPermissionCatalog(),
        queryRoles()
      ]);
      setCatalog(items || []);
      setRoles(page.items || []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return catalog;
    }
    return catalog.filter((item) => {
      const group = intl
        .formatMessage({
          id: `permissions.group.${item.group}`,
          defaultMessage: item.group
        })
        .toLowerCase();
      const desc = intl
        .formatMessage({
          id: `permissions.desc.${item.key}`,
          defaultMessage: item.description
        })
        .toLowerCase();
      return (
        item.key.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        group.includes(q) ||
        desc.includes(q)
      );
    });
  }, [catalog, intl, search]);

  const rows: CatalogRow[] = React.useMemo(() => {
    const groups = new Map<string, PermissionItem[]>();
    for (const item of filtered) {
      const list = groups.get(item.group) || [];
      list.push(item);
      groups.set(item.group, list);
    }
    const next: CatalogRow[] = [];
    for (const [group, items] of groups.entries()) {
      next.push({ rowKey: `group-${group}`, isGroup: true, group });
      for (const item of items) {
        next.push({
          rowKey: item.key,
          isGroup: false,
          group: item.group,
          key: item.key,
          description: item.description
        });
      }
    }
    return next;
  }, [filtered]);

  const handleToggle = async (
    role: RoleItem,
    permission: string,
    granted: boolean
  ) => {
    if (role.builtin || !canWrite) {
      return;
    }
    const token = `${role.id}:${permission}`;
    setPending(token);
    try {
      const updated = await patchRolePermission(role.id, permission, granted);
      setRoles((prev) =>
        prev.map((item) =>
          item.id === role.id ? { ...item, ...updated } : item
        )
      );
    } catch {
      message.error(intl.formatMessage({ id: 'permissions.toggle.failed' }));
    } finally {
      setPending(null);
    }
  };

  return (
    <PageBox>
      <p className={styles.description}>
        {intl.formatMessage({ id: 'permissions.page.description' })}
      </p>
      <Space
        align="center"
        style={{
          marginBottom: 16,
          width: '100%',
          justifyContent: 'space-between'
        }}
      >
        <Input.Search
          allowClear
          style={{ width: 280 }}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={intl.formatMessage({ id: 'permissions.search' })}
        />
        <span className={styles.hint}>
          {intl.formatMessage({ id: 'permissions.builtinHint' })}
        </span>
      </Space>
      <Table
        rowKey="rowKey"
        loading={loading}
        dataSource={rows}
        pagination={false}
        scroll={{ x: Math.max(720, 280 + roles.length * 140) }}
        columns={[
          {
            title: intl.formatMessage({ id: 'permissions.column.key' }),
            dataIndex: 'key',
            fixed: 'left',
            width: 280,
            render: (_: string, row: CatalogRow) => {
              if (row.isGroup) {
                return (
                  <span className={styles.group}>
                    {intl.formatMessage({
                      id: `permissions.group.${row.group}`,
                      defaultMessage: row.group
                    })}
                  </span>
                );
              }
              return (
                <div>
                  <div className={styles.key}>{row.key}</div>
                  <Typography.Text type="secondary">
                    {intl.formatMessage({
                      id: `permissions.desc.${row.key}`,
                      defaultMessage: row.description
                    })}
                  </Typography.Text>
                </div>
              );
            }
          },
          ...roles.map((role) => ({
            title: (
              <span>
                {role.name}
                {role.builtin ? (
                  <Tag style={{ marginLeft: 6 }}>
                    {intl.formatMessage({ id: 'roles.builtin' })}
                  </Tag>
                ) : null}
              </span>
            ),
            dataIndex: role.id,
            width: 140,
            align: 'center' as const,
            render: (_: unknown, row: CatalogRow) => {
              if (row.isGroup) {
                return null;
              }
              const granted = (role.permissions || []).includes(row.key);
              return (
                <Checkbox
                  checked={granted}
                  disabled={
                    role.builtin ||
                    !canWrite ||
                    pending === `${role.id}:${row.key}`
                  }
                  onChange={(event) =>
                    handleToggle(role, row.key, event.target.checked)
                  }
                />
              );
            }
          }))
        ]}
      />
    </PageBox>
  );
};

Permissions.displayName = 'Permissions';

export default Permissions;
