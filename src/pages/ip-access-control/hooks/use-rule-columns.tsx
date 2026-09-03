import { AutoTooltip, DropdownButtons, icons } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Switch, Tag } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { ListItem } from '../config/types';

const rowActionList = [
  {
    label: 'common.button.edit',
    key: 'edit',
    locale: true,
    icon: icons.EditOutlined
  },
  {
    label: 'common.button.delete',
    key: 'delete',
    locale: true,
    icon: icons.DeleteOutlined,
    props: {
      danger: true
    }
  }
];

interface ColumnsHookProps {
  handleSelect: (val: string, record: ListItem) => void;
  onToggleEnabled: (record: ListItem, enabled: boolean) => void;
  sortOrder: string[];
}

const useRuleColumns = ({
  handleSelect,
  onToggleEnabled,
  sortOrder
}: ColumnsHookProps): ColumnsType<ListItem> => {
  const intl = useIntl();

  return useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'ipAccess.table.priority' }),
        dataIndex: 'priority',
        key: 'priority',
        sorter: true,
        width: 100
      },
      {
        title: intl.formatMessage({ id: 'common.table.name' }),
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <AutoTooltip ghost style={{ maxWidth: 300 }}>
            <span className="text-primary">{text}</span>
          </AutoTooltip>
        )
      },
      {
        title: intl.formatMessage({ id: 'ipAccess.form.cidr' }),
        dataIndex: 'cidr',
        key: 'cidr',
        width: 200,
        ellipsis: { showTitle: false },
        render: (text: string) => <AutoTooltip ghost>{text}</AutoTooltip>
      },
      {
        title: intl.formatMessage({ id: 'ipAccess.form.action' }),
        dataIndex: 'action',
        key: 'action',
        width: 120,
        render: (text: string) => (
          <Tag color={text === 'allow' ? 'success' : 'error'}>
            {intl.formatMessage({
              id:
                text === 'allow'
                  ? 'ipAccess.action.allow'
                  : 'ipAccess.action.deny'
            })}
          </Tag>
        )
      },
      {
        title: intl.formatMessage({ id: 'ipAccess.form.enabled' }),
        dataIndex: 'enabled',
        key: 'enabled',
        width: 110,
        render: (enabled: boolean, record: ListItem) => (
          <Switch
            size="small"
            checked={enabled}
            onChange={(checked) => onToggleEnabled(record, checked)}
          />
        )
      },
      {
        title: intl.formatMessage({ id: 'common.table.description' }),
        dataIndex: 'description',
        key: 'description',
        ellipsis: { showTitle: false },
        render: (text: string) => <AutoTooltip ghost>{text || '-'}</AutoTooltip>
      },
      {
        title: intl.formatMessage({ id: 'common.table.createTime' }),
        dataIndex: 'created_at',
        key: 'created_at',
        width: 180,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <AutoTooltip ghost>
            {text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </AutoTooltip>
        )
      },
      {
        title: intl.formatMessage({ id: 'common.table.operation' }),
        key: 'operation',
        dataIndex: 'operation',
        width: 150,
        render: (_text, record) => (
          <DropdownButtons
            items={rowActionList}
            onSelect={(val) => handleSelect(val, record)}
          />
        )
      }
    ],
    [handleSelect, onToggleEnabled, sortOrder, intl]
  );
};

export default useRuleColumns;
