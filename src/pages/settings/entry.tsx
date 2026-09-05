import { Navigate, useAccess } from '@umijs/max';

const SettingsEntry: React.FC = () => {
  const access = useAccess();
  if (access.canSeeAdmin || access.canSeeIpAccess) {
    return <Navigate to="/settings/environment" replace />;
  }
  return <Navigate to="/settings/profile" replace />;
};

export default SettingsEntry;
