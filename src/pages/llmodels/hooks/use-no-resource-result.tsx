import { clusterSessionAtom } from '@/atoms/clusters';
import { EmptyState } from '@/components/console';
import { IconFont } from '@gpustack/core-ui';
import { useIntl, useNavigate } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import { Button } from 'antd';
import { useAtom } from 'jotai';
import _ from 'lodash';
import React, { useMemo } from 'react';

/**Title: Generally, this is from the activation page.
 * DefaultContent: This content from the activate page, for example, the activate page is Deployments page,
 * then the defaultContent is for deployment.
 * @param props
 * @returns
 */
const useNoResourceResult = (props: {
  iconType: string;
  loading?: boolean;
  loadend?: boolean;
  dataSource?: any[];
  queryParams?: Record<string, any>;
  title: React.ReactNode;
  noClusters?: boolean;
  noWorkers?: boolean;
  subTitle?: React.ReactNode;
  defaultContent?: {
    subTitle: string;
    noFoundText: string;
    buttonText: string;
    onClick: () => void;
  };
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const {
    noClusters,
    noWorkers,
    defaultContent,
    queryParams,
    iconType,
    title,
    subTitle
  } = props;
  const [, setClusterSession] = useAtom(clusterSessionAtom);

  const handleClick = useMemoizedFn(() => {
    if (noClusters) {
      setClusterSession({
        firstAddWorker: false,
        firstAddCluster: true
      });

      navigate(`/resources/clusters/list`);
      return;
    }

    if (noWorkers) {
      setClusterSession({
        firstAddWorker: true,
        firstAddCluster: false
      });
      navigate(`/resources/clusters/list`);
    }
  });

  const statusContent = useMemo(() => {
    if (noClusters) {
      return {
        subTitle:
          subTitle || intl.formatMessage({ id: 'noresult.resources.cluster' }),
        noFoundText: defaultContent?.noFoundText || '',
        buttonText: intl.formatMessage({
          id: 'noresult.resources.gotocluster'
        }),
        onClick: handleClick
      };
    }

    if (noWorkers) {
      return {
        subTitle:
          subTitle || intl.formatMessage({ id: 'noresult.resources.worker' }),
        noFoundText: defaultContent?.noFoundText || '',
        buttonText: intl.formatMessage({ id: 'noresult.resources.gotoworker' }),
        onClick: handleClick
      };
    }

    return {
      ...defaultContent
    };
  }, [noClusters, noWorkers, intl]);

  const filtered = Object.entries(
    _.omit(queryParams, ['sort_by', 'page', 'perPage'])
  ).some(([, value]) => value !== undefined && value !== '' && value !== null);

  const noResourceResult = (
    <EmptyState
      icon={<IconFont type={iconType} />}
      title={
        filtered && statusContent.noFoundText
          ? statusContent.noFoundText
          : title
      }
      description={filtered ? undefined : statusContent.subTitle}
      action={
        statusContent.onClick && statusContent.buttonText ? (
          <Button type="primary" onClick={statusContent.onClick}>
            {statusContent.buttonText}
          </Button>
        ) : undefined
      }
      style={{ minHeight: 'calc(100vh - 300px)' }}
    />
  );
  return {
    noResourceResult,
    handleCreate: handleClick
  };
};

export default useNoResourceResult;
