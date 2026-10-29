import React, { useEffect, useRef, useState } from 'react';
import { Paper, Stack, Text } from '@mantine/core';
import type { IgvBrowserConfiguration } from './types';

interface IgvBrowserProps extends IgvBrowserConfiguration {
  bamUrl: string;
  baiUrl: string;
}

const IGVBrowser = ({
  bamUrl,
  baiUrl,
  locus = 'chr5:40,200,000-40,300,000',
  track,
  genome,
  showDefaultTracks = true,
}: IgvBrowserProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const browserRef = useRef<any>(null);

  const [ivg, setIvg] = useState<any>(null);

  /** lazy load of igv.js on a component load as recommended in the documentation */
  useEffect(() => {
    void (async () => {
      if (!containerRef.current) return;

      // Import the ESM build (recommended by igv.js docs)
      // @ts-ignore
      const igvMod = await import('igv/dist/igv.esm.min.js');
      const igv = igvMod.default;
      setIvg(igv);
    })();
  }, []);

  // Initialize IGV once index is ready
  useEffect(() => {
    if (!ivg) return;

    let disposed = false;

    const init = async () => {
      if (!containerRef.current || browserRef.current || disposed) return;

      if (browserRef.current) {
        ivg.removeBrowser(browserRef.current);
        browserRef.current = null;
      }

      const options = {
        genome,
        locus,
        showDefaultTracks: false,
        tracks: [
          track,
          {
            name: 'Tumor Alignments',
            type: 'alignment',
            format: 'bam',
            url: bamUrl,
            indexURL: baiUrl,
            colorBy: 'strand',
            viewAsPairs: true,
            coverageThreshold: 0.2,
            visibilityWindow: 300000,
            getPopupData: function (feature: any) {
              const data: { name: string; value: string }[] = [];
              if (!feature) return data;

              // Core read fields
              const coreFields: [string, keyof typeof feature][] = [
                ['Read Name', 'readName'],
                ['Chr', 'chr'],
                ['Start', 'start'],
                ['End', 'end'],
                ['Strand', 'strand'],
                ['MAPQ', 'mq'],
                ['CIGAR', 'cigar'],
                ['Flags', 'flags'],
              ];

              for (const [label, key] of coreFields) {
                if (feature[key] != null) {
                  data.push({ name: label, value: String(feature[key]) });
                }
              }

              // BAM tags - safely handle object or Map
              if (feature.tags) {
                const tags = feature.tags;
                if (tags instanceof Map) {
                  tags.forEach((v: any, k: string) => {
                    data.push({ name: k, value: String(v) });
                  });
                } else if (typeof tags === 'object') {
                  Object.entries(tags).forEach(([k, v]) => {
                    data.push({ name: k, value: String(v) });
                  });
                }
              }

              return data;
            },
          },
        ],
      };

      try { // create the IGV Browser
        browserRef.current = await ivg.createBrowser(
          containerRef.current,
          options,
        );
      } catch (error) {
        console.error('Error creating IGV browser:', error);
      }
    };

    void init();

    return () => { // remove browser when component unmounts
      disposed = true;
      if (browserRef.current && (window as any).igv) {
        (window as any).igv.removeBrowser(browserRef.current);
      }
    };
  }, [bamUrl, baiUrl, ivg, genome, track, locus]);

  return (
    <Stack gap="md" w="100%">
      {!ivg && (
        <Paper p="md" withBorder>
          <Text c="dimmed">Loading IGV viewer...</Text>
        </Paper>
      )}

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </Stack>
  );
};

export default IGVBrowser;
