import { notificationDrawerOpenAtom } from '@/atoms/notification';
import {
  BellOutlined,
  CloseOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Drawer, Empty, Spin, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { useAtom } from 'jotai';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  markAnnouncementRead,
  queryPublishedAnnouncements,
  type AnnouncementItem
} from '../announcements/apis';

const useStyles = createStyles(({ css, token }) => ({
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 0;
  `,
  title: css`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    color: var(--console-text, ${token.colorText});
  `,
  close: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--console-text-secondary, ${token.colorTextSecondary});
    cursor: pointer;

    &:hover {
      background: var(--console-bg-hover, ${token.colorFillTertiary});
    }
  `,
  tabs: css`
    padding: 0 20px;
    margin-top: 4px;

    .ant-tabs-nav {
      margin-bottom: 0;
    }

    .ant-tabs-tab {
      padding: 10px 0;
      font-size: 14px;
    }
  `,
  list: css`
    height: calc(100vh - 108px);
    overflow-y: auto;
    padding: 0 20px;
  `,
  item: css`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 0;
    border-bottom: 1px solid var(--console-border, ${token.colorSplit});
  `,
  icon: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-top: 2px;
    flex-shrink: 0;
    border-radius: 999px;
    background: color-mix(in srgb, ${token.colorPrimary} 10%, transparent);
    color: ${token.colorPrimary};
    font-size: 14px;
  `,
  content: css`
    min-width: 0;
    flex: 1;
  `,
  time: css`
    margin-bottom: 6px;
    font-size: 12px;
    line-height: 18px;
    color: var(--console-text-tertiary, ${token.colorTextTertiary});
  `,
  itemTitle: css`
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    color: var(--console-text, ${token.colorText});
  `,
  body: css`
    font-size: 13px;
    line-height: 22px;
    color: var(--console-text-secondary, ${token.colorTextSecondary});
    word-break: break-word;

    p {
      margin: 0 0 8px;
    }

    p:last-child {
      margin-bottom: 0;
    }

    a {
      color: ${token.colorPrimary};
    }

    strong {
      font-weight: 600;
      color: var(--console-text, ${token.colorText});
    }
  `,
  empty: css`
    display: flex;
    min-height: 16rem;
    align-items: center;
    justify-content: center;
  `
}));

const formatStamp = (value?: string | null, locale?: string) => {
  if (!value) {
    return '';
  }
  const time = dayjs(value).locale(
    locale?.toLowerCase().startsWith('zh') ? 'zh-cn' : 'en'
  );
  return `${time.fromNow()} · ${time.format('YYYY-MM-DD HH:mm')}`;
};

const AnnouncementList: React.FC<{
  items: AnnouncementItem[];
  loading: boolean;
}> = ({ items, loading }) => {
  const intl = useIntl();
  const { styles } = useStyles();

  if (loading) {
    return (
      <div className={styles.empty}>
        <Spin />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={intl.formatMessage({
            id: 'announcements.noresult.title'
          })}
        />
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <article key={item.id} className={styles.item}>
          <span className={styles.icon}>
            <InfoCircleOutlined />
          </span>
          <div className={styles.content}>
            <div className={styles.time}>
              {formatStamp(item.published_at || item.created_at, intl.locale)}
            </div>
            <div className={styles.itemTitle}>{item.title}</div>
            <div className={styles.body}>
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  )
                }}
              >
                {item.body}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

const NotificationDrawer: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [open, setOpen] = useAtom(notificationDrawerOpenAtom);
  const [tab, setTab] = React.useState('announcements');
  const markedRef = React.useRef<Set<number>>(new Set());

  const { data, loading, refresh } = useRequest(queryPublishedAnnouncements, {
    ready: open,
    refreshDeps: [open]
  });

  const items = data?.items || [];

  React.useEffect(() => {
    if (!open || !items.length) {
      return;
    }
    items
      .filter((item) => item.unread && !markedRef.current.has(item.id))
      .forEach((item) => {
        markedRef.current.add(item.id);
        void markAnnouncementRead(item.id);
      });
  }, [open, items]);

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      placement="right"
      width={420}
      closable={false}
      destroyOnClose={false}
      styles={{
        header: { display: 'none' },
        body: { padding: 0 }
      }}
    >
      <div className={styles.header}>
        <div className={styles.title}>
          <BellOutlined />
          {intl.formatMessage({ id: 'inbox.notifications' })}
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={() => setOpen(false)}
          aria-label={intl.formatMessage({ id: 'common.button.close' })}
        >
          <CloseOutlined />
        </button>
      </div>
      <Tabs
        className={styles.tabs}
        activeKey={tab}
        onChange={(key) => {
          setTab(key);
          if (key === 'announcements') {
            refresh();
          }
        }}
        items={[
          {
            key: 'announcements',
            label: intl.formatMessage({ id: 'inbox.announcements' })
          },
          {
            key: 'messages',
            label: intl.formatMessage({ id: 'inbox.messages' })
          }
        ]}
      />
      {tab === 'announcements' ? (
        <AnnouncementList items={items} loading={loading} />
      ) : (
        <div className={styles.empty}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({
              id: 'inbox.messages.unavailable'
            })}
          />
        </div>
      )}
    </Drawer>
  );
};

export default NotificationDrawer;
