import { MetaChip } from '@/components/console';
import { convertFileSize } from '@/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { TooltipOverlayScroller } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import classNames from 'classnames';
import _ from 'lodash';
import React from 'react';
import 'simplebar-react/dist/simplebar.min.css';
import { getFileType } from '../../constants/file-type';
import '../../style/hf-model-file.less';
import IncompatiableInfo from '../incompatiable-info';
import FileParts from './file-parts';

interface ModelFileItemProps {
  data: Record<string, any>;
  isEvaluating: boolean;
  active: boolean;
  handleSelectModelFile: (item: any) => void;
}

const FilePartsTag = (props: { parts: any[] }) => {
  const { parts } = props;
  const intl = useIntl();
  if (!props.parts || !props.parts.length) {
    return null;
  }

  return (
    <TooltipOverlayScroller title={<FileParts fileList={parts}></FileParts>}>
      <MetaChip className="tag-item" icon={<InfoCircleOutlined />}>
        {intl.formatMessage({ id: 'models.search.parts' }, { n: parts.length })}
      </MetaChip>
    </TooltipOverlayScroller>
  );
};

const ModelFileItem: React.FC<ModelFileItemProps> = (props) => {
  const { data: item, isEvaluating, active, handleSelectModelFile } = props;

  const getModelQuantizationType = (item: any) => {
    let path = item.path;
    if (item?.parts?.length) {
      path = `${item.path}.gguf`;
    }
    const quanType = getFileType(path);
    if (quanType) {
      return <MetaChip className="tag-item">{_.toUpper(quanType)}</MetaChip>;
    }
    return null;
  };

  return (
    <div
      className={classNames('hf-model-file', {
        active: active
      })}
      onClick={() => handleSelectModelFile(item)}
    >
      <div className="title">{item.path}</div>
      <div className="tags flex-between">
        <span className="flex-center gap-8">
          <MetaChip className="tag-item">{convertFileSize(item.size)}</MetaChip>
          {getModelQuantizationType(item)}
          <FilePartsTag parts={item.parts}></FilePartsTag>
        </span>
        <IncompatiableInfo
          isEvaluating={isEvaluating}
          data={item.evaluateResult}
        ></IncompatiableInfo>
      </div>
    </div>
  );
};

export default ModelFileItem;
