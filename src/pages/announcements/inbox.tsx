import { useIntl } from '@umijs/max';
import { Empty, List, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import PageBox from '../_components/page-box';
import {
  markAnnouncementRead,
  queryPublishedAnnouncements,
  type AnnouncementItem
} from './apis';

const AnnouncementInbox: React.FC = () => {
  const intl = useIntl();
  const [items, setItems] = React.useState<AnnouncementItem[]>([]);

  const load = React.useCallback(async () => {
    const res = await queryPublishedAnnouncements();
    setItems(res.items || []);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <PageBox>
      {items.length ? (
        <List
          itemLayout="vertical"
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              onClick={() => {
                if (item.unread) {
                  markAnnouncementRead(item.id).then(load);
                }
              }}
            >
              <List.Item.Meta
                title={
                  <>
                    {item.title}
                    {item.unread && (
                      <Tag color="processing" style={{ marginLeft: 8 }}>
                        {intl.formatMessage(
                          { id: 'inbox.unread' },
                          { count: 1 }
                        )}
                      </Tag>
                    )}
                  </>
                }
                description={
                  item.published_at
                    ? dayjs(item.published_at).format('YYYY-MM-DD HH:mm')
                    : ''
                }
              />
              <div style={{ whiteSpace: 'pre-wrap' }}>{item.body}</div>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description={intl.formatMessage({
            id: 'announcements.noresult.title'
          })}
        />
      )}
    </PageBox>
  );
};

export default AnnouncementInbox;
