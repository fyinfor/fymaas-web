import { NotificationOutlined } from '@ant-design/icons';
import { history, useIntl } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Badge } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { queryAnnouncementUnread } from '../announcements/apis';

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
  const { data: announcementUnread } = useRequest(queryAnnouncementUnread, {
    pollingInterval: 30000
  });

  return (
    <IconWrapper
      title={intl.formatMessage({ id: 'inbox.announcements' })}
      onClick={() => history.push('/announcements')}
    >
      <Badge
        count={announcementUnread?.unread || 0}
        size="small"
        offset={[2, -2]}
      >
        <NotificationOutlined />
      </Badge>
    </IconWrapper>
  );
};

export default InboxCenter;
