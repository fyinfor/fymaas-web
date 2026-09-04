import { Button } from 'antd';
import _ from 'lodash';
import React from 'react';
import EmptyState from './empty-state';

export const hasActiveFilters = (
  queryParams?: Record<string, any>,
  omitKeys: string[] = ['sort_by', 'page', 'perPage']
) =>
  Object.entries(_.omit(queryParams || {}, omitKeys)).some(([, value]) => {
    if (value === undefined || value === '' || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });

const ListEmpty: React.FC<{
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  noFound?: React.ReactNode;
  queryParams?: Record<string, any>;
  omitKeys?: string[];
  onAdd?: () => void;
  addText?: React.ReactNode;
}> = ({
  icon,
  title,
  description,
  noFound,
  queryParams,
  omitKeys,
  onAdd,
  addText
}) => {
  const filtered = hasActiveFilters(queryParams, omitKeys);
  return (
    <EmptyState
      icon={icon}
      title={filtered && noFound ? noFound : title}
      description={filtered ? undefined : description}
      action={
        !filtered && onAdd && addText ? (
          <Button type="primary" onClick={onAdd}>
            {addText}
          </Button>
        ) : undefined
      }
      style={{ minHeight: 'calc(100vh - 300px)' }}
    />
  );
};

export default ListEmpty;
