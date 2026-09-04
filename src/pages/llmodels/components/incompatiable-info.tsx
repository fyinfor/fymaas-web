import { StatusBadge } from '@/components/console';
import { LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import { TooltipOverlayScroller } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import React from 'react';
import styled from 'styled-components';
import { EvaluateResult } from '../config/types';

interface IncompatiableInfoProps {
  data?: EvaluateResult;
  isEvaluating?: boolean;
}

const IncompatibleInfo = styled.div`
  display: flex;
  flex-direction: column;
  ul {
    margin: 0;
    font-size: var(--font-size-small);
    padding: 0;
    padding-left: 16px;
    color: var(--color-white-secondary);
    list-style: none;
    &.error-msg {
      padding-left: 0;
    }
    li {
      position: relative;
      line-height: 20px;
      white-space: pre-wrap;
    }
    li.normal::before {
      position: absolute;
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      left: -14px;
      top: 8px;
      border-radius: 50%;
      background-color: var(--color-white-secondary);
    }
  }
`;

const SMTitle = styled.div<{ $isTitle?: boolean }>`
  font-weight: ${(props) => (props.$isTitle ? 'bold' : 'normal')};
  font-size: var(--font-size-small);
`;

const MessageList = ({
  messageList,
  error
}: {
  messageList: string[];
  error?: boolean;
}) => {
  return (
    <ul className={`${error ? 'error-msg' : ''}`}>
      {messageList.map((item, index) => (
        <li key={index} className={`${!error ? 'normal' : 'error'}`}>
          {item}
        </li>
      ))}
    </ul>
  );
};

const IncompatiableInfo: React.FC<IncompatiableInfoProps> = (props) => {
  const { data, isEvaluating } = props;
  const { error, error_message, compatibility_messages, scheduling_messages } =
    data || {};
  const intl = useIntl();

  if (isEvaluating) {
    return (
      <StatusBadge
        tone="info"
        title={intl.formatMessage({ id: 'models.form.evaluating' })}
      >
        <LoadingOutlined />
      </StatusBadge>
    );
  }
  if (!data || data?.compatible) {
    return null;
  }
  const messageList = [
    ...(compatibility_messages || []),
    ...(scheduling_messages || []),
    ...(error_message ? [error_message] : [])
  ];
  return (
    <TooltipOverlayScroller
      maxHeight={200}
      title={
        <IncompatibleInfo>
          <SMTitle $isTitle={true}>
            {error
              ? intl.formatMessage({ id: 'models.search.evaluate.error' })
              : intl.formatMessage({ id: 'models.form.incompatible' })}
          </SMTitle>
          <MessageList messageList={messageList} error={error}></MessageList>
        </IncompatibleInfo>
      }
    >
      <StatusBadge tone={error ? 'danger' : 'warning'}>
        <WarningOutlined />
      </StatusBadge>
    </TooltipOverlayScroller>
  );
};

export default IncompatiableInfo;
