"use client";

import { useEffect, useState } from "react";
import { loadDownload, type LoadedDownload } from "./loadDownload";

/** One download, loaded once per url. null while it loads, or when there's no url. */
export function useDownload(url: string | null): LoadedDownload | null {
  const [loaded, setLoaded] = useState<{ url: string; result: LoadedDownload } | null>(null);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    void loadDownload(url, { signal: controller.signal }).then((result) => {
      if (!controller.signal.aborted) setLoaded({ url, result });
    });
    return () => controller.abort();
  }, [url]);

  // keyed by url, so a new url never shows the last one's file
  return url && loaded?.url === url ? loaded.result : null;
}
