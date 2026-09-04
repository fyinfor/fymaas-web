import {
  currentOrganizationIdAtom,
  currentWorkspaceIdAtom
} from '@/atoms/user';
import { clearAtomStorage, setAtomStorage } from '@/atoms/utils';
import { nsLocal } from '@gpustack/core-ui/utils';

const WORKSPACE_LIST_KEY = 'workspaceList';
const ORGANIZATION_LIST_KEY = 'organizationList';

export const persistWorkspaceSelection = (id: number | null) => {
  if (id == null) {
    nsLocal.remove('currentWorkspaceId');
    nsLocal.remove('currentOrganizationId');
    clearAtomStorage(currentWorkspaceIdAtom);
    clearAtomStorage(currentOrganizationIdAtom);
    return;
  }
  nsLocal.set('currentWorkspaceId', JSON.stringify(id));
  nsLocal.set('currentOrganizationId', JSON.stringify(id));
  setAtomStorage(currentWorkspaceIdAtom, id);
  setAtomStorage(currentOrganizationIdAtom, id);
};

export const readCurrentWorkspaceId = (): number | null => {
  try {
    const raw =
      nsLocal.get('currentWorkspaceId') || nsLocal.get('currentOrganizationId');
    if (!raw) return null;
    const value = JSON.parse(raw);
    return typeof value === 'number' && value > 0 ? value : null;
  } catch {
    return null;
  }
};

/** Drop act-as headers and membership caches. Login must not reuse a
 * previous session's workspace id — that id may no longer exist. */
export const clearTenantContextStorage = () => {
  persistWorkspaceSelection(null);
  nsLocal.remove(WORKSPACE_LIST_KEY);
  nsLocal.remove(ORGANIZATION_LIST_KEY);
};

export const pickFallbackWorkspaceId = (
  staleId?: number | null
): number | null => {
  try {
    const list = JSON.parse(nsLocal.get(WORKSPACE_LIST_KEY) || '[]');
    if (!Array.isArray(list)) return null;
    const next = list.find(
      (item: { id?: number; is_personal?: boolean }) =>
        typeof item?.id === 'number' && item.id !== staleId && !item.is_personal
    );
    return typeof next?.id === 'number' ? next.id : null;
  } catch {
    return null;
  }
};
