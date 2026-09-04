import React from 'react';
import ErrorState from './error-state';
import TableSkeleton from './table-skeleton';

const TableLoadGate: React.FC<{
  loading?: boolean;
  loadend?: boolean;
  error?: boolean;
  hasRows?: boolean;
  onRetry?: () => void;
  columns?: number;
  rows?: number;
  children: React.ReactNode;
}> = ({
  loading,
  loadend,
  error,
  hasRows,
  onRetry,
  columns = 6,
  rows = 6,
  children
}) => {
  if (loading && !loadend) {
    return <TableSkeleton rows={rows} columns={columns} />;
  }
  if (error && !hasRows) {
    return (
      <ErrorState
        onRetry={onRetry}
        style={{ minHeight: 'calc(100vh - 300px)' }}
      />
    );
  }
  return <>{children}</>;
};

export default TableLoadGate;
