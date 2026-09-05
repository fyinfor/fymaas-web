import { useAccess, useIntl, useModel } from '@umijs/max';
import {
  Badge,
  Button,
  Empty,
  Input,
  List,
  Modal,
  Space,
  Spin,
  message
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import styled from 'styled-components';
import PageBox from '../_components/page-box';
import {
  createThread,
  markThreadRead,
  queryThread,
  queryThreads,
  queryUnreadCount,
  replyThread,
  type MessageEntry,
  type MessageThread,
  type MessageThreadDetail
} from './apis';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 560px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 8px;
  overflow: hidden;
  background: var(--ant-color-bg-container);
`;

const ThreadPane = styled.div`
  border-right: 1px solid var(--ant-color-border-secondary);
  display: flex;
  flex-direction: column;
`;

const DetailPane = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const PaneHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid var(--ant-color-border-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Messages = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Bubble = styled.div<{ $mine?: boolean }>`
  align-self: ${(props) => (props.$mine ? 'flex-end' : 'flex-start')};
  max-width: 72%;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${(props) =>
    props.$mine
      ? 'var(--ant-color-primary-bg)'
      : 'var(--ant-color-fill-quaternary)'};
  white-space: pre-wrap;
  word-break: break-word;
`;

const ReplyBar = styled.div`
  padding: 12px 16px;
  border-top: 1px solid var(--ant-color-border-secondary);
`;

interface MessagesPageProps {
  admin?: boolean;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ admin = false }) => {
  const intl = useIntl();
  const currentUser = useModel('@@initialState')?.initialState?.currentUser;
  const [threads, setThreads] = React.useState<MessageThread[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<MessageThreadDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [reply, setReply] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createTitle, setCreateTitle] = React.useState('');
  const [createBody, setCreateBody] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        queryThreads(admin),
        queryUnreadCount(admin)
      ]);
      setThreads(list.items || []);
      setUnread(count.unread || 0);
      setSelectedId((current) => {
        if (current && (list.items || []).some((item) => item.id === current)) {
          return current;
        }
        return list.items?.[0]?.id ?? null;
      });
    } catch {
      message.error(intl.formatMessage({ id: 'inbox.loadFailed' }));
    } finally {
      setLoading(false);
    }
  }, [admin, intl]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (selectedId == null) {
      setDetail(null);
      return;
    }
    queryThread(selectedId, admin)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [admin, selectedId]);

  const unreadKey = admin ? 'unread_for_admin' : 'unread_for_user';

  const handleSend = async () => {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    try {
      const created = await replyThread(selectedId, reply.trim(), admin);
      setDetail((current) =>
        current ? { ...current, data: [...current.data, created] } : current
      );
      setReply('');
      await load();
    } catch {
      message.error(intl.formatMessage({ id: 'inbox.sendFailed' }));
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async () => {
    if (!selectedId) return;
    await markThreadRead(selectedId, admin);
    await load();
  };

  const handleCreate = async () => {
    if (!createBody.trim()) return;
    const created = await createThread({
      title: createTitle.trim() || intl.formatMessage({ id: 'inbox.messages' }),
      body: createBody.trim()
    });
    setCreateOpen(false);
    setCreateTitle('');
    setCreateBody('');
    setSelectedId(created.id);
    await load();
  };

  const senderLabel = (entry: MessageEntry) => {
    if (entry.sender_user_id === currentUser?.id) {
      return intl.formatMessage({ id: 'inbox.me' });
    }
    if (admin && entry.sender_user_id === detail?.thread.user_id) {
      return (
        detail.thread.user_username || intl.formatMessage({ id: 'inbox.user' })
      );
    }
    return intl.formatMessage({ id: 'inbox.staff' });
  };

  return (
    <PageBox>
      <Layout>
        <ThreadPane>
          <PaneHeader>
            <Badge
              count={unread}
              overflowCount={99}
              size="small"
              offset={[8, 0]}
            >
              <span>
                {unread
                  ? intl.formatMessage(
                      { id: 'inbox.unread' },
                      { count: unread }
                    )
                  : intl.formatMessage({ id: 'inbox.nounread' })}
              </span>
            </Badge>
            <Space>
              <Button size="small" onClick={load}>
                {intl.formatMessage({ id: 'inbox.refresh' })}
              </Button>
              {!admin && (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => setCreateOpen(true)}
                >
                  {intl.formatMessage({ id: 'inbox.newThread' })}
                </Button>
              )}
            </Space>
          </PaneHeader>
          <Spin spinning={loading}>
            {threads.length ? (
              <List
                dataSource={threads}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background:
                        item.id === selectedId
                          ? 'var(--ant-color-fill-quaternary)'
                          : undefined
                    }}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{item.title}</span>
                          {item[unreadKey] > 0 && (
                            <Badge count={item[unreadKey]} size="small" />
                          )}
                        </Space>
                      }
                      description={
                        <>
                          {admin && item.user_username ? (
                            <div>{item.user_username}</div>
                          ) : null}
                          <div>{item.last_message || '-'}</div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                style={{ marginTop: 80 }}
                description={intl.formatMessage({
                  id: admin ? 'inbox.empty.admin' : 'inbox.empty.threads'
                })}
              />
            )}
          </Spin>
        </ThreadPane>
        <DetailPane>
          {detail ? (
            <>
              <PaneHeader>
                <strong>{detail.thread.title}</strong>
                <Button size="small" onClick={handleMarkRead}>
                  {intl.formatMessage({ id: 'inbox.markRead' })}
                </Button>
              </PaneHeader>
              <Messages>
                {detail.data.map((entry) => (
                  <Bubble
                    key={entry.id}
                    $mine={entry.sender_user_id === currentUser?.id}
                  >
                    <div
                      style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}
                    >
                      {senderLabel(entry)} ·{' '}
                      {dayjs(entry.created_at).format('MM-DD HH:mm')}
                    </div>
                    {entry.body}
                  </Bubble>
                ))}
              </Messages>
              <ReplyBar>
                <Input.TextArea
                  rows={3}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={intl.formatMessage({ id: 'inbox.reply' })}
                />
                <Button
                  type="primary"
                  style={{ marginTop: 8 }}
                  loading={sending}
                  disabled={!reply.trim()}
                  onClick={handleSend}
                >
                  {intl.formatMessage({ id: 'inbox.send' })}
                </Button>
              </ReplyBar>
            </>
          ) : (
            <Empty
              style={{ margin: 'auto' }}
              description={intl.formatMessage({ id: 'inbox.empty.detail' })}
            />
          )}
        </DetailPane>
      </Layout>
      <Modal
        open={createOpen}
        title={intl.formatMessage({ id: 'inbox.newThread' })}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okButtonProps={{ disabled: !createBody.trim() }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder={intl.formatMessage({ id: 'inbox.title' })}
            value={createTitle}
            onChange={(event) => setCreateTitle(event.target.value)}
          />
          <Input.TextArea
            rows={4}
            placeholder={intl.formatMessage({ id: 'inbox.body' })}
            value={createBody}
            onChange={(event) => setCreateBody(event.target.value)}
          />
        </Space>
      </Modal>
    </PageBox>
  );
};

export const AdminMessagesPage: React.FC = () => {
  const access = useAccess();
  if (!access.canSeeOrgAdmin) {
    return null;
  }
  return <MessagesPage admin />;
};

export default MessagesPage;
