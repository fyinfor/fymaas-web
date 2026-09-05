import { MailOutlined, NotificationOutlined } from '@ant-design/icons';
import { history, useIntl } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Badge, Dropdown } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { queryAnnouncementUnread } from '../announcements/apis';
import { queryUnreadCount } from '../messages/apis';

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
  const { data: messageUnread } = useRequest(() => queryUnreadCount(false), {
    pollingInterval: 30000
  });
  const { data: announcementUnread } = useRequest(queryAnnouncementUnread, {
    pollingInterval: 30000
  });

  return (
    <>
      <Dropdown
        menu={{
          items: [
            {
              key: 'messages',
              label: intl.formatMessage({ id: 'inbox.messages' }),
              onClick: () => history.push('/messages')
            }
          ]
        }}
      >
        <IconWrapper title={intl.formatMessage({ id: 'inbox.messages' })}>
          <Badge
            count={messageUnread?.unread || 0}
            size="small"
            offset={[2, -2]}
          >
            <MailOutlined />
          </Badge>
        </IconWrapper>
      </Dropdown>
      <Dropdown
        menu={{
          items: [
            {
              key: 'announcements',
              label: intl.formatMessage({ id: 'inbox.announcements' }),
              onClick: () => history.push('/announcements')
            }
          ]
        }}
      >
        <IconWrapper title={intl.formatMessage({ id: 'inbox.announcements' })}>
          <Badge
            count={announcementUnread?.unread || 0}
            size="small"
            offset={[2, -2]}
          >
            <NotificationOutlined />
          </Badge>
        </IconWrapper>
      </Dropdown>
    </>
  );
};

export default InboxCenter;
