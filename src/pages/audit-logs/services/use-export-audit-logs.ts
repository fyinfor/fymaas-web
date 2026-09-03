import { downloadFile } from '@/utils/download-stream';
import { useIntl } from '@umijs/max';
import { message } from 'antd';
import React from 'react';
import { downloadAuditLogs } from '../apis';
import { AuditLogFilters } from '../config/types';

const FILENAME_PATTERN = /filename="?([^"]+)"?/;

const filenameFromDisposition = (disposition?: string | null): string => {
  const matched = disposition?.match(FILENAME_PATTERN);
  return matched ? matched[1] : '';
};

/**
 * Read the error payload off a failed export.
 *
 * The response is blob-typed, so a failure arrives as a Blob that the
 * global interceptor cannot parse — it would surface axios's own
 * "Request failed with status code 403" instead of what the server said.
 */
const readExportError = async (error: any): Promise<string | undefined> => {
  const body = error?.response?.data ?? error?.data;
  try {
    const text = body instanceof Blob ? await body.text() : undefined;
    const payload = text ? JSON.parse(text) : body;
    return payload?.message;
  } catch {
    return undefined;
  }
};

export default function useExportAuditLogs() {
  const intl = useIntl();
  const [exporting, setExporting] = React.useState(false);

  // ``exporting`` drives the disabled state, but state updates are async:
  // two clicks in the same tick would both see false and both fire a full
  // export. A ref flips synchronously.
  const inFlight = React.useRef(false);

  const exportData = async (filters: AuditLogFilters) => {
    if (inFlight.current) {
      return false;
    }
    inFlight.current = true;
    setExporting(true);
    try {
      const { data, headers } = await downloadAuditLogs(filters);
      // The server owns the filename; this is only reached when
      // Content-Disposition is unreadable.
      const filename =
        filenameFromDisposition(headers?.['content-disposition']) ||
        'audit_logs.csv';
      downloadFile(data, filename);
      return true;
    } catch (error: any) {
      const serverMessage = await readExportError(error);
      message.error(
        serverMessage || intl.formatMessage({ id: 'auditLogs.export.failed' })
      );
      return false;
    } finally {
      inFlight.current = false;
      setExporting(false);
    }
  };

  return { exporting, exportData };
}
