const WORKSPACE_LIST_EVENT = 'fymaas-workspace-list-changed';

/** Management/create/delete pages call this so the sidebar switcher reloads. */
export const notifyWorkspaceListChanged = () => {
  window.dispatchEvent(new Event(WORKSPACE_LIST_EVENT));
};

export const subscribeWorkspaceListChanged = (onChange: () => void) => {
  window.addEventListener(WORKSPACE_LIST_EVENT, onChange);
  return () => window.removeEventListener(WORKSPACE_LIST_EVENT, onChange);
};
