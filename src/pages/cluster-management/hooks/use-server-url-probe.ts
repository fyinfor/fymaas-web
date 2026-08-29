import { useEffect, useState } from 'react';
import { probeServerUrl } from '../apis';
import { ProbeServerUrlResult } from '../config/types';

export default function useServerUrlProbe(url: string) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProbeServerUrlResult | null>(null);

  useEffect(() => {
    const trimmed = (url || '').trim();
    if (!trimmed) {
      setLoading(false);
      setResult(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await probeServerUrl({ url: trimmed });
        if (!cancelled) {
          setResult(data);
        }
      } catch {
        // Probe API missing (older server) or request failed — don't
        // pretend the worker URL itself is unreachable.
        if (!cancelled) {
          setResult(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [url]);

  return { loading, result };
}
