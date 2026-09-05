import { downloadFile } from '@/utils/download-stream';
import { useIntl } from '@umijs/max';
import { message } from 'antd';
import React from 'react';
import { downloadRequestLogs } from '../apis';
import { LogFilters, LogKind } from '../config/types';

const FILENAME_PATTERN = /filename="?([^"]+)"?/;

const filenameFromDisposition = (disposition?: string | null): string => {
  const matched = disposition?.match(FILENAME_PATTERN);
  return matched ? matched[1] : '';
};

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

export default function useExportLogs(kind: LogKind) {
  const intl = useIntl();
  const [exporting, setExporting] = React.useState(false);
  const inFlight = React.useRef(false);

  const exportData = async (filters: LogFilters) => {
    if (inFlight.current) {
      return false;
    }
    inFlight.current = true;
    setExporting(true);
    try {
      const { data, headers } = await downloadRequestLogs(kind, filters);
      const filename =
        filenameFromDisposition(headers?.['content-disposition']) ||
        `${kind}_logs.csv`;
      downloadFile(data, filename);
      return true;
    } catch (error: any) {
      const serverMessage = await readExportError(error);
      message.error(
        serverMessage || intl.formatMessage({ id: 'requestLogs.export.failed' })
      );
      return false;
    } finally {
      inFlight.current = false;
      setExporting(false);
    }
  };

  return { exporting, exportData };
}
