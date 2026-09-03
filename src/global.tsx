// Logic that runs globally and before the application will be executed here

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { registerEnterprisePlugin } from './enterprise';

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Synchronously, at module load: `getInitialState` calls
// GPUStackPluginManager.initialize(), and a plugin registered after that
// point is never initialised. This module runs before any runtime
// config, so the registration is always in place by then.
registerEnterprisePlugin();
