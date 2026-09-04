import { getOrgById } from '@/atoms/user';
import { MetaChip } from '@/components/console';
import { SimpleSelect } from '@gpustack/core-ui';
import { nsLocal } from '@gpustack/core-ui/utils';
import { useAccess, useIntl } from '@umijs/max';
import { Form, Select } from 'antd';
import React from 'react';
import {
  formatWorkspaceName,
  loadMyWorkspaces,
  type MyWorkspaceItem
} from './workspace-switcher';

const useWorkspaceOptions = () => {
  const intl = useIntl();
  const [items, setItems] = React.useState<MyWorkspaceItem[]>([]);
  React.useEffect(() => {
    loadMyWorkspaces()
      .then(setItems)
      .catch(() => undefined);
  }, []);
  return items
    .filter((item) => !item.workspace?.is_personal)
    .map((item) => {
      const ws = item.workspace;
      const orgName = ws.organization?.display_name || ws.organization?.name;
      const name = formatWorkspaceName(ws, intl);
      return {
        value: ws.id,
        label: orgName ? `${orgName} / ${name}` : name
      };
    });
};

export const CreateOrgScopeField: React.FC<{
  context?: { action?: string };
}> = ({ context }) => {
  const intl = useIntl();
  const access = useAccess();
  const options = useWorkspaceOptions();
  const current = React.useMemo(() => {
    try {
      const raw =
        nsLocal.get('currentWorkspaceId') ||
        nsLocal.get('currentOrganizationId');
      if (!raw) return undefined;
      const value = JSON.parse(raw);
      return typeof value === 'number' ? value : undefined;
    } catch {
      return undefined;
    }
  }, []);

  if (context?.action === 'edit' || context?.action === 'update') {
    return null;
  }
  if (!access.canSeeAdmin && !access.canSeeOrgAdmin) {
    return null;
  }
  if (options.length <= 1 && current) {
    return (
      <Form.Item name="owner_principal_id" hidden initialValue={current}>
        <input type="hidden" />
      </Form.Item>
    );
  }

  return (
    <Form.Item
      name="owner_principal_id"
      label={intl.formatMessage({
        id: 'workspaces.form.scope',
        defaultMessage: 'Workspace'
      })}
      initialValue={current}
    >
      <Select
        allowClear={!!access.canSeeAdmin}
        options={options}
        placeholder={intl.formatMessage({
          id: 'workspaces.form.scopePlaceholder',
          defaultMessage: 'Current workspace'
        })}
      />
    </Form.Item>
  );
};

export const OwnerScopeTag: React.FC<{
  ownerId?: number | null;
  context?: {
    ownerId?: number | null;
    ownerPrincipalId?: number | null;
    record?: { owner_principal_id?: number };
  };
}> = (props) => {
  const intl = useIntl();
  const ownerId =
    props.ownerId ??
    props.context?.ownerId ??
    props.context?.ownerPrincipalId ??
    props.context?.record?.owner_principal_id;
  const cached = getOrgById(ownerId);
  if (ownerId == null) {
    return (
      <MetaChip>
        {intl.formatMessage({
          id: 'workspaces.tag.global',
          defaultMessage: 'Global'
        })}
      </MetaChip>
    );
  }
  const label = cached
    ? formatWorkspaceName(
        {
          name: cached.name,
          display_name: cached.display_name,
          id: cached.id
        },
        intl
      )
    : String(ownerId);
  return <MetaChip>{label}</MetaChip>;
};

export const UsageFilterBar: React.FC<{
  context?: {
    organizationOptions?: { value: number; label: string }[];
    selectedOrganizations?: number[];
    onOrganizationsChange?: (ids: number[]) => void;
    optionLabelRender?: any;
  };
}> = ({ context }) => {
  const intl = useIntl();
  const options = useWorkspaceOptions();
  const merged = options.length ? options : context?.organizationOptions || [];
  if (!merged.length || !context?.onOrganizationsChange) {
    return null;
  }
  return (
    <SimpleSelect
      allowClear
      showSearch
      mode="multiple"
      maxTagCount="responsive"
      options={merged}
      placeholder={intl.formatMessage({
        id: 'workspaces.filter',
        defaultMessage: 'Filter by workspace'
      })}
      styles={{ wrapper: { flex: 1, maxWidth: 280, minWidth: 160 } }}
      value={context.selectedOrganizations || []}
      onChange={context.onOrganizationsChange}
    />
  );
};

export const ResourceUsageFilterBar = UsageFilterBar;
