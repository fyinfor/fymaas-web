import { notificationDrawerOpenAtom } from '@/atoms/notification';
import { BellOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Badge } from 'antd';
import { useAtom } from 'jotai';
import React from 'react';
import styled from 'styled-components';
import { queryAnnouncementUnread } from '../announcements/apis';
import NotificationDrawer from './notification-drawer';

const IconWrapper = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--console-text-secondary);
  transition:
    background-color 120ms ease,
    color 120ms ease;

  &:hover {
    background: var(--console-bg-hover);
    color: var(--console-text);
  }
`;

const InboxCenter: React.FC = () => {
  const intl = useIntl();
  const [open, setOpen] = useAtom(notificationDrawerOpenAtom);
  const { data: announcementUnread, refresh } = useRequest(
    queryAnnouncementUnread,
    {
      pollingInterval: 30000
    }
  );

  React.useEffect(() => {
    if (!open) {
      refresh();
    }
  }, [open, refresh]);

  return (
    <>
      <IconWrapper
        title={intl.formatMessage({ id: 'inbox.notifications' })}
        onClick={() => {
          setOpen(true);
          refresh();
        }}
      >
        <Badge
          count={announcementUnread?.unread || 0}
          size="small"
          offset={[2, -2]}
        >
          <BellOutlined />
        </Badge>
      </IconWrapper>
      <NotificationDrawer />
    </>
  );
};

export default InboxCenter;
