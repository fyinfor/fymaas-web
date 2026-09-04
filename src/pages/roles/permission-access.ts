import type { PermissionItem } from '../permissions/apis';

export type AccessLevel = 'none' | 'read' | 'write' | 'custom';

export const isReadKey = (key: string) => key.endsWith(':read');

export const groupAccessLevel = (
  items: PermissionItem[],
  granted: string[]
): AccessLevel => {
  const grantedSet = new Set(granted);
  const keys = items.map((item) => item.key);
  const readKeys = keys.filter(isReadKey);
  const writeKeys = keys.filter((key) => !isReadKey(key));
  const selected = keys.filter((key) => grantedSet.has(key));
  if (selected.length === 0) {
    return 'none';
  }
  if (selected.length === keys.length) {
    return writeKeys.length ? 'write' : 'read';
  }
  if (
    writeKeys.length > 0 &&
    readKeys.length > 0 &&
    readKeys.every((key) => grantedSet.has(key)) &&
    writeKeys.every((key) => !grantedSet.has(key))
  ) {
    return 'read';
  }
  return 'custom';
};

export const keysForAccessLevel = (
  items: PermissionItem[],
  level: Exclude<AccessLevel, 'custom'>
) => {
  if (level === 'none') {
    return [];
  }
  if (level === 'read') {
    return items.filter((item) => isReadKey(item.key)).map((item) => item.key);
  }
  return items.map((item) => item.key);
};

export const mergeGroupPermissions = (
  current: string[],
  items: PermissionItem[],
  nextGroupKeys: string[]
) => {
  const groupSet = new Set(items.map((item) => item.key));
  const kept = current.filter((key) => !groupSet.has(key));
  return [...new Set([...kept, ...nextGroupKeys])];
};
