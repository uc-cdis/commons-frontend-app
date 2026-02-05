
import React, { useEffect, useRef } from 'react';



type IgvBrowserProps = {
  genome?: string;
  locus?: string;
  height?: number;
};

const IgvBrowser = ({
  genome = 'hg38',
  locus = 'chr1:155,140,000-155,160,000',
  height = 500,
}: IgvBrowserProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const browserRef = useRef<any>(null);


  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!containerRef.current) return;

      // Import the ESM build (recommended by igv.js docs)
      const igvMod = await import('igv/dist/igv.esm.min.js');
      const igv = igvMod.default;

      const options = {
        genome,
        locus,
        tracks: [],
      };

      const browser = await igv.createBrowser(containerRef.current, options);

      if (cancelled) {
        await browser.dispose?.();
        return;
      }

      browserRef.current = browser;
    })();

    return () => {
      cancelled = true;
      browserRef.current?.dispose?.();
      browserRef.current = null;
    };
  }, [genome, locus]);



  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        border: '1px solid #ddd',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    />
  );
}

export default IgvBrowser;
