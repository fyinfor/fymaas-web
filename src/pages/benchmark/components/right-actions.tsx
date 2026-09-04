import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DropdownButtons, IconFont } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button, Space, Tooltip } from 'antd';
import React from 'react';

export interface RightActionsProps {
  handleDeleteByBatch: () => void;
  handleClickPrimary?: () => void;
  handleExport?: () => void;
  handleCompare?: () => void;
  settingButton?: React.ReactNode;
  buttonText?: string;
  rowSelection: {
    selectedRowKeys: React.Key[];
  };
}

const RightActions: React.FC<RightActionsProps> = ({
  handleDeleteByBatch,
  handleClickPrimary,
  handleExport,
  handleCompare,
  settingButton,
  buttonText,
  rowSelection
}) => {
  const intl = useIntl();
  const selectedCount = rowSelection.selectedRowKeys.length;
  const canCompare = selectedCount >= 2 && selectedCount <= 4;
  const ButtonList = [
    {
      label: 'benchmark.table.export.results',
      key: 'export',
      icon: (
        <IconFont type="icon-export" style={{ lineHeight: 1, fontSize: 16 }} />
      )
    },
    {
      label: 'common.button.delete',
      key: 'delete',
      props: {
        danger: true
      },
      icon: <DeleteOutlined />
    }
  ];

  const handleActionSelect = (val: string) => {
    if (val === 'delete') {
      handleDeleteByBatch();
    } else if (val === 'export') {
      handleExport?.();
    }
  };

  return (
    <Space size={16}>
      {settingButton}
      <Tooltip
        title={
          canCompare
            ? undefined
            : intl.formatMessage({ id: 'benchmark.compare.select' })
        }
      >
        <span>
          <Button disabled={!canCompare} onClick={handleCompare}>
            {intl.formatMessage({ id: 'benchmark.button.compare' })}
          </Button>
        </span>
      </Tooltip>
      <Button
        icon={<PlusOutlined></PlusOutlined>}
        color="primary"
        variant="outlined"
        onClick={handleClickPrimary}
      >
        {buttonText}
      </Button>
      <DropdownButtons
        items={ButtonList}
        extra={
          rowSelection.selectedRowKeys.length > 0 && (
            <span>({rowSelection.selectedRowKeys.length})</span>
          )
        }
        size="large"
        showText={true}
        disabled={!rowSelection.selectedRowKeys.length}
        onSelect={handleActionSelect}
      />
    </Space>
  );
};

export default RightActions;
