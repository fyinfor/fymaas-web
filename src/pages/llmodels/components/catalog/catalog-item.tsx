import fallbackImg from '@/assets/images/img.png';
import { isCustomSourceType } from '@/pages/_components/source-config/config';
import { AutoTooltip } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button, Typography } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { modelCategories } from '../../config';
import { CatalogItem as CatalogItemType } from '../../config/types';
import '../../style/catalog-item.less';

interface CatalogItemProps {
  activeId: number;
  data: CatalogItemType;
  onClick: (data: CatalogItemType) => void;
}

const getHomeLabel = (home?: string) => {
  if (!home) return '';
  try {
    const url = new URL(home);
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname.includes('huggingface.co') && parts[0]) {
      return parts[0];
    }
    if (url.hostname.includes('modelscope') && parts[0]) {
      return parts[0];
    }
    return url.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const CatalogItem: React.FC<CatalogItemProps> = (props) => {
  const intl = useIntl();
  const { onClick, activeId, data } = props;

  const handleOnClick = useCallback(() => {
    onClick(data);
  }, [data, onClick]);

  const handleDeploy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(data);
  };

  const handleOnError = (e: any) => {
    e.target.src = fallbackImg;
  };

  const homeLabel = getHomeLabel(data.home);
  const categoryLabel =
    _.find(modelCategories, { value: data.categories?.[0] })?.label ||
    data.categories?.[0];
  const sizeLabel = data.size
    ? data.activated_size
      ? `${data.size}${data.size_unit || 'B'}-A${data.activated_size}B`
      : `${data.size}${data.size_unit || 'B'}`
    : '';

  const description = useMemo(() => {
    if (!data.description) return null;
    return (
      <Typography.Paragraph
        className="desc"
        ellipsis={{
          rows: 2,
          tooltip: (
            <div
              className="custome-scrollbar"
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                maxHeight: 300,
                maxWidth: 300,
                overflow: 'auto'
              }}
            >
              {data.description}
            </div>
          )
        }}
      >
        {data.description}
      </Typography.Paragraph>
    );
  }, [data.description]);

  return (
    <div
      onClick={handleOnClick}
      className={classNames('catalog-item', { active: activeId === data.id })}
    >
      <div className="content">
        <div className="title">
          <div className="title-main">
            <div className="img">
              <img
                src={data.icon || fallbackImg}
                alt=""
                onError={handleOnError}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="name">
                <AutoTooltip ghost>{data.name}</AutoTooltip>
              </div>
              {(homeLabel || categoryLabel) && (
                <div className="meta">
                  {[homeLabel, categoryLabel].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          </div>
          <Button type="primary" size="small" onClick={handleDeploy}>
            {intl.formatMessage({ id: 'common.button.deploy' })}
          </Button>
        </div>
        {description}
      </div>
      <div className="item-footer">
        <div className="specs">
          {isCustomSourceType(data.source_type) && (
            <span className="spec">
              {intl.formatMessage({ id: 'common.source.tag.custom' })}
            </span>
          )}
          {sizeLabel && <span className="spec">{sizeLabel}</span>}
          {data.release_date && (
            <span className="update-time">{data.release_date}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogItem;
