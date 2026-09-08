import { notificationDrawerOpenAtom } from '@/atoms/notification';
import { BellOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Empty } from 'antd';
import { useSetAtom } from 'jotai';
import React from 'react';
import PageBox from '../_components/page-box';

const AnnouncementInbox: React.FC = () => {
  const intl = useIntl();
  const setOpen = useSetAtom(notificationDrawerOpenAtom);

  React.useEffect(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    <PageBox>
      <div
        style={{
          minHeight: '28rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Empty
          image={<BellOutlined style={{ fontSize: 36 }} />}
          description={intl.formatMessage({
            id: 'inbox.notifications.hint'
          })}
        >
          <Button type="primary" onClick={() => setOpen(true)}>
            {intl.formatMessage({ id: 'inbox.notifications' })}
          </Button>
        </Empty>
      </div>
    </PageBox>
  );
};

export default AnnouncementInbox;
