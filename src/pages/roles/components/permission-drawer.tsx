import { roleDisplayName } from '@/enterprise/role-labels';
import { useIntl } from '@umijs/max';
import {
  Button,
  Checkbox,
  Collapse,
  Drawer,
  Input,
  Select,
  Space,
  Tag,
  Typography
} from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import type { PermissionItem, RoleItem } from '../../permissions/apis';
import { groupAccessLevel, type AccessLevel } from '../permission-access';

const useStyles = createStyles(({ css }) => ({
  hint: css`
    margin-top: 0;
    margin-bottom: 16px;
  `,
  toolbar: css`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  `,
  card: css`
    border: 1px solid var(--border-default);
    border-radius: 8px;
    background: var(--bg-card, var(--ant-color-bg-container));
    overflow: hidden;
  `,
  header: css`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
  `,
  title: css`
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 22px;
  `,
  summary: css`
    margin-top: 4px;
    font-size: 12px;
    line-height: 18px;
    color: var(--ant-color-text-secondary);
  `,
  row: css`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
    border-top: 1px solid var(--border-soft, var(--ant-color-split));
  `,
  rowBody: css`
    min-width: 0;
    flex: 1;
  `,
  rowTitle: css`
    display: block;
    font-size: 13px;
    line-height: 20px;
    color: var(--text-primary);
  `,
  rowKey: css`
    margin-left: 8px;
    font-size: 12px;
    color: var(--ant-color-text-quaternary);
  `,
  empty: css`
    padding: 24px 0;
    text-align: center;
    color: var(--ant-color-text-secondary);
  `
}));

type PermissionDrawerProps = {
  role: RoleItem | null;
  catalog: PermissionItem[];
  canWrite: boolean;
  pending: boolean;
  onClose: () => void;
  onToggle: (permission: string, granted: boolean) => void;
  onSetGroupLevel: (
    items: PermissionItem[],
    level: Exclude<AccessLevel, 'custom'>
  ) => void;
  onGrantAll: () => void;
  onRevokeAll: () => void;
};

const PermissionDrawer: React.FC<PermissionDrawerProps> = ({
  role,
  catalog,
  canWrite,
  pending,
  onClose,
  onToggle,
  onSetGroupLevel,
  onGrantAll,
  onRevokeAll
}) => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [search, setSearch] = React.useState('');
  const readonly = !!role?.builtin || !canWrite;
  const granted = role?.permissions || [];

  React.useEffect(() => {
    setSearch('');
  }, [role?.id]);

  const grouped = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const groups = new Map<string, PermissionItem[]>();
    for (const item of catalog) {
      const groupLabel = intl.formatMessage({
        id: `permissions.group.${item.group}`,
        defaultMessage: item.group
      });
      const desc = intl.formatMessage({
        id: `permissions.desc.${item.key}`,
        defaultMessage: item.description
      });
      if (
        q &&
        !item.key.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q) &&
        !groupLabel.toLowerCase().includes(q) &&
        !desc.toLowerCase().includes(q)
      ) {
        continue;
      }
      const list = groups.get(item.group) || [];
      list.push(item);
      groups.set(item.group, list);
    }
    return [...groups.entries()];
  }, [catalog, intl, search]);

  return (
    <Drawer
      open={!!role}
      width={720}
      onClose={onClose}
      title={intl.formatMessage(
        { id: 'roles.permissions.title' },
        { name: role ? roleDisplayName(role, intl.formatMessage) : '' }
      )}
    >
      <Typography.Paragraph type="secondary" className={styles.hint}>
        {intl.formatMessage({
          id: role?.builtin
            ? 'roles.permissions.builtinHint'
            : 'roles.permissions.hint'
        })}
      </Typography.Paragraph>
      <div className={styles.toolbar}>
        <Input.Search
          allowClear
          style={{ flex: 1 }}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={intl.formatMessage({ id: 'permissions.search' })}
        />
        {readonly ? null : (
          <Space>
            <Button
              disabled={
                pending || catalog.every((item) => granted.includes(item.key))
              }
              onClick={onGrantAll}
            >
              {intl.formatMessage({ id: 'roles.permissions.selectAll' })}
            </Button>
            <Button
              disabled={pending || granted.length === 0}
              onClick={onRevokeAll}
            >
              {intl.formatMessage({ id: 'roles.permissions.clearAll' })}
            </Button>
          </Space>
        )}
      </div>
      {grouped.length === 0 ? (
        <div className={styles.empty}>
          {intl.formatMessage({ id: 'common.data.none' })}
        </div>
      ) : (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {grouped.map(([group, items]) => {
            const level = groupAccessLevel(items, granted);
            const hasWrite = items.some((item) => !item.key.endsWith(':read'));
            const selectedCount = items.filter((item) =>
              granted.includes(item.key)
            ).length;
            return (
              <div key={group} className={styles.card}>
                <div className={styles.header}>
                  <div>
                    <div className={styles.title}>
                      {intl.formatMessage({
                        id: `permissions.group.${group}`,
                        defaultMessage: group
                      })}
                    </div>
                    <div className={styles.summary}>
                      {intl.formatMessage(
                        { id: 'roles.permissions.granted' },
                        { count: selectedCount, total: items.length }
                      )}
                      {level === 'custom' ? (
                        <Tag style={{ marginLeft: 8 }}>
                          {intl.formatMessage({
                            id: 'roles.permissions.level.custom'
                          })}
                        </Tag>
                      ) : null}
                    </div>
                  </div>
                  <Select
                    value={level === 'custom' ? 'custom' : level}
                    disabled={readonly || pending}
                    style={{ width: 128, flexShrink: 0 }}
                    onChange={(next) => {
                      if (next === 'custom') {
                        return;
                      }
                      onSetGroupLevel(items, next);
                    }}
                    options={[
                      {
                        value: 'none',
                        label: intl.formatMessage({
                          id: 'roles.permissions.level.none'
                        })
                      },
                      {
                        value: 'read',
                        label: intl.formatMessage({
                          id: 'roles.permissions.level.read'
                        })
                      },
                      ...(hasWrite
                        ? [
                            {
                              value: 'write',
                              label: intl.formatMessage({
                                id: 'roles.permissions.level.write'
                              })
                            }
                          ]
                        : []),
                      ...(level === 'custom'
                        ? [
                            {
                              value: 'custom',
                              label: intl.formatMessage({
                                id: 'roles.permissions.level.custom'
                              })
                            }
                          ]
                        : [])
                    ]}
                  />
                </div>
                <Collapse
                  ghost
                  items={[
                    {
                      key: group,
                      label: intl.formatMessage({
                        id: 'roles.permissions.details'
                      }),
                      children: (
                        <div>
                          {items.map((item) => (
                            <div key={item.key} className={styles.row}>
                              <Checkbox
                                checked={granted.includes(item.key)}
                                disabled={readonly || pending}
                                onChange={(event) =>
                                  onToggle(item.key, event.target.checked)
                                }
                              />
                              <div className={styles.rowBody}>
                                <span className={styles.rowTitle}>
                                  {intl.formatMessage({
                                    id: `permissions.desc.${item.key}`,
                                    defaultMessage: item.description
                                  })}
                                  <span className={styles.rowKey}>
                                    {item.key}
                                  </span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            );
          })}
        </Space>
      )}
    </Drawer>
  );
};

export default PermissionDrawer;
