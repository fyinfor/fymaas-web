import { StatusBadge, statusTone } from '@/components/console';
import { useIntl } from '@umijs/max';
import { Tooltip } from 'antd';
import React from 'react';
import {
  BenchmarkStatus,
  BenchmarkStatusLabelMap,
  BenchmarkStatusValueMap
} from '../config';

// The run's state as a StatusBadge — shared by the list's Status column and the
// detail page header so both read identically.
//
// Only a RUNNING run gets a percent suffix. A stopped run is terminal — it can't
// be resumed — so a frozen bar (which reads as "still going / can continue") is
// misleading. Render it as a plain "Stopped" badge like Completed/Error, and
// move how-far-it-got into the hover tooltip so the label stays clean.
const BenchmarkStateTag: React.FC<{
  data?: {
    state?: string;
    progress?: number;
    state_message?: string;
  } | null;
}> = ({ data }) => {
  const intl = useIntl();
  if (!data?.state) {
    return null;
  }
  const isRunning = data.state === BenchmarkStatusValueMap.Running;
  const isStopped = data.state === BenchmarkStatusValueMap.Stopped;
  const runningDone = isRunning && data.progress === 100;

  let message = runningDone ? '' : data.state_message;
  if (isStopped && data.progress) {
    const reached = intl.formatMessage(
      { id: 'benchmark.state.stoppedAt' },
      { percent: Math.round(data.progress) }
    );
    message = data.state_message
      ? `${reached} · ${data.state_message}`
      : reached;
  }

  const tone = statusTone(
    runningDone
      ? BenchmarkStatus[BenchmarkStatusValueMap.Completed]
      : BenchmarkStatus[data.state]
  );
  const badge = (
    <StatusBadge tone={tone} plain>
      {BenchmarkStatusLabelMap[data.state]}
      {isRunning && !runningDone ? ` ${Math.round(data.progress || 0)}%` : ''}
    </StatusBadge>
  );

  return message ? <Tooltip title={message}>{badge}</Tooltip> : badge;
};

export default BenchmarkStateTag;
