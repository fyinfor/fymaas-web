import { IconFont } from '@gpustack/core-ui';
import { useAccess, useAppData, useIntl, useNavigate } from '@umijs/max';
import { Empty, Input, Modal } from 'antd';
import { createStyles } from 'antd-style';
import { useEffect, useMemo, useState } from 'react';

interface PaletteItem {
  path: string;
  localeKey: string;
  icon?: string;
}

const useStyles = createStyles(({ css }) => ({
  modal: css`
    .ant-modal-content {
      padding: 0;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: var(--console-shadow-sm);
    }

    .ant-modal-body {
      padding: 0;
    }
  `,
  search: css`
    padding: 12px 16px;
    border-bottom: 1px solid var(--console-divider);

    .ant-input-affix-wrapper,
    .ant-input {
      height: 36px !important;
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }
  `,
  list: css`
    max-height: 360px;
    overflow: auto;
    padding: 8px;
  `,
  item: css`
    display: flex;
    align-items: center;
    gap: 10px;
    height: 36px;
    padding: 0 10px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--console-text-secondary);
    font-size: 13px;

    &:hover,
    &.active {
      background: var(--console-brand-soft);
      color: var(--console-brand);
    }
  `,
  empty: css`
    padding: 32px 0;
  `
}));

const collectMenuItems = (
  routes: any[] = [],
  parentNames: string[] = [],
  access?: Record<string, boolean>
): PaletteItem[] => {
  const items: PaletteItem[] = [];

  routes.forEach((route) => {
    if (
      !route ||
      route.hideInMenu ||
      route.layout === false ||
      route.redirect
    ) {
      return;
    }

    const path = String(route.originPath || route.path || '').replace('/*', '');
    if (path === '*' || path === '/login') {
      return;
    }

    if (route.access && access && access[route.access] === false) {
      return;
    }

    const names = route.name ? [...parentNames, route.name] : parentNames;

    if (route.name && path && path.startsWith('/') && !route.isLayout) {
      items.push({
        path,
        localeKey: `menu.${names.join('.')}`,
        icon: route.defaultIcon || route.icon
      });
    }

    const children = route.routes || route.children;
    if (Array.isArray(children)) {
      items.push(...collectMenuItems(children, names, access));
    }
  });

  return items;
};

const CommandPalette: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { styles, cx } = useStyles();
  const intl = useIntl();
  const navigate = useNavigate();
  const access = useAccess() as Record<string, boolean>;
  const { clientRoutes } = useAppData();
  const [keyword, setKeyword] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    const source = clientRoutes || [];
    const unique = new Map<string, PaletteItem>();
    collectMenuItems(source, [], access).forEach((item) => {
      if (!unique.has(item.path)) {
        unique.set(item.path, item);
      }
    });
    return Array.from(unique.values());
  }, [access, clientRoutes]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items.slice(0, 20);
    return items
      .filter((item) => {
        const name = intl.formatMessage({
          id: item.localeKey,
          defaultMessage: item.path
        });
        return (
          name.toLowerCase().includes(q) || item.path.toLowerCase().includes(q)
        );
      })
      .slice(0, 20);
  }, [intl, items, keyword]);

  useEffect(() => {
    if (open) {
      setKeyword('');
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [keyword]);

  const go = (item?: PaletteItem) => {
    if (!item) return;
    navigate(item.path);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={520}
      className={styles.modal}
      destroyOnHidden
    >
      <div className={styles.search}>
        <Input
          autoFocus
          allowClear
          size="middle"
          value={keyword}
          placeholder={intl.formatMessage({
            id: 'common.command.placeholder'
          })}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIndex((prev) =>
                filtered.length ? (prev + 1) % filtered.length : 0
              );
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIndex((prev) =>
                filtered.length
                  ? (prev - 1 + filtered.length) % filtered.length
                  : 0
              );
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              go(filtered[activeIndex]);
            }
          }}
        />
      </div>
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({ id: 'common.command.empty' })}
            />
          </div>
        ) : (
          filtered.map((item, index) => (
            <div
              key={item.path}
              className={cx(styles.item, index === activeIndex && 'active')}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => go(item)}
            >
              <IconFont type={item.icon || 'icon-dashboard'} />
              <span>
                {intl.formatMessage({
                  id: item.localeKey,
                  defaultMessage: item.path
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default CommandPalette;
