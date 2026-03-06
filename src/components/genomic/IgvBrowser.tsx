
import React, { useEffect, useRef, useState } from 'react';
import { Progress, Text, Stack, Paper, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { IgvBrowserConfiguration } from './types';
// import { GEN3_ANALYSIS_API } from '@gen3/core';
import { GEN3_API } from '@gen3/core';

export const GEN3_ANALYSIS_API =
  process.env.NEXT_PUBLIC_GEN3_ANALYSIS_API || `${GEN3_API}/analysis/v0`;


const SERVICE_URL = `${GEN3_ANALYSIS_API}/genomic_viz`;


interface ProgressState {
  status: 'idle' | 'processing' | 'complete' | 'error';
  stage?: 'download' | 'indexing';
  progress: number;
  message?: string;
  downloaded_mb?: number;
  total_mb?: number;
  elapsed_seconds?: number;
  estimated_seconds?: number;
}

interface IgvBrowserProps extends IgvBrowserConfiguration{
  bamUrl: string;
}


const IgvBrowser = ({
  bamUrl,
  locus = 'chr5:40,200,000-40,300,000',
  track,
  genome = 'canFam3',
  showDefaultTracks = true,
}: IgvBrowserProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const browserRef = useRef<any>(null);
  const [indexUrl, setIndexUrl] = useState<string>('');
  const [progressState, setProgressState] = useState<ProgressState>({
    status: 'idle',
    progress: 0,
  });

  const [ivg, setIvg] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!containerRef.current) return;

      // Import the ESM build (recommended by igv.js docs)
      const igvMod = await import('igv/dist/igv.esm.min.js');
      const igv = igvMod.default;
      setIvg(igv);
    })();
  }, []);

  // Check if index exists, or start creating it with progress
  useEffect(() => {
    const checkAndCreateIndex = async () => {
      try {
        // First check if index already exists
        const statusResponse = await fetch(
          `${SERVICE_URL}/bam/index/status?url=${encodeURIComponent(bamUrl)}`,
        );
        if (!statusResponse.ok) {
          throw new Error(
            `Server returned ${statusResponse.status}: ${statusResponse.statusText}`,
          );
        }
        const statusData = await statusResponse.json();

        if (statusData.exists) {
          // Index already cached
          setIndexUrl(`${SERVICE_URL}${statusData.bai_url}`);
          setProgressState({ status: 'complete', progress: 100 });
          return;
        }

        // Start processing with SSE progress
        const eventSource = new EventSource(
          `${SERVICE_URL}/bam/index/progress?url=${encodeURIComponent(bamUrl)}`,
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);

          setProgressState({
            status: data.status,
            stage: data.stage,
            progress: data.progress || 0,
            message: data.message,
            downloaded_mb: data.downloaded_mb,
            total_mb: data.total_mb,
            elapsed_seconds: data.elapsed_seconds,
            estimated_seconds: data.estimated_seconds,
          });

          if (data.status === 'complete') {
            setIndexUrl(`${SERVICE_URL}${data.url}`);
            eventSource.close();
          } else if (data.status === 'error') {
            console.error('Index creation failed:', data.message);
            eventSource.close();
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          eventSource.close();
          setProgressState({
            status: 'error',
            progress: 0,
            message: 'Connection error',
          });
        };
      } catch (error) {
        const isNetworkError =
          error instanceof TypeError && error.message === 'Failed to fetch';
        setProgressState({
          status: 'error',
          progress: 0,
          message: isNetworkError
            ? `Unable to connect to the genomic visualization service at ${SERVICE_URL}. Please ensure the service is running and accessible.`
            : `Failed to check index status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    };

    checkAndCreateIndex();
  }, [bamUrl]);

  // Initialize IGV once index is ready
  useEffect(() => {
    if (!ivg || !indexUrl || progressState.status !== 'complete') return;

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
            indexURL: indexUrl,
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

      try {
        browserRef.current = await ivg.createBrowser(
          containerRef.current,
          options,
        );
      } catch (error) {
        console.error('Error creating IGV browser:', error);
      }
    };

    void init();

    return () => {
      disposed = true;
      if (browserRef.current && (window as any).igv) {
        (window as any).igv.removeBrowser(browserRef.current);
      }
    };
  }, [bamUrl, indexUrl, ivg, progressState.status]);

  const getStageLabel = () => {
    if (progressState.stage === 'download') return 'Downloading BAM file';
    if (progressState.stage === 'indexing') return 'Creating index';
    return 'Initializing';
  };

  const getProgressColor = () => {
    if (progressState.status === 'error') return 'red';
    if (progressState.status === 'complete') return 'green';
    if (progressState.stage === 'download') return 'blue';
    if (progressState.stage === 'indexing') return 'cyan';
    return 'gray';
  };

  const renderProgress = () => {
    if (progressState.status === 'idle') {
      return (
        <Paper p="md" withBorder>
          <Text c="dimmed">Initializing...</Text>
        </Paper>
      );
    }

    if (progressState.status === 'error') {
      return (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
          {progressState.message || 'Unknown error occurred'}
        </Alert>
      );
    }

    if (progressState.status === 'complete') {
      return null; // IGV will render
    }

    return (
      <Paper p="xl" withBorder shadow="sm">
        <Stack gap="md">
          <Text size="lg" fw={500}>
            {getStageLabel()}
          </Text>

          <Progress
            value={progressState.progress}
            size="xl"
            radius="md"
            color={getProgressColor()}
            striped
            animated
          />

          <Text size="sm" c="dimmed">
            {progressState.progress.toFixed(1)}% complete
          </Text>

          {progressState.stage === 'download' &&
            progressState.downloaded_mb && (
              <Text size="sm" c="dimmed">
                {progressState.downloaded_mb.toFixed(1)} MB /{' '}
                {progressState.total_mb?.toFixed(1)} MB
              </Text>
            )}

          {progressState.stage === 'indexing' &&
            progressState.elapsed_seconds && (
              <Text size="sm" c="dimmed">
                Elapsed: {progressState.elapsed_seconds.toFixed(0)}s
                {progressState.estimated_seconds &&
                  ` / ~${progressState.estimated_seconds.toFixed(0)}s estimated`}
              </Text>
            )}
        </Stack>
      </Paper>
    );
  };

  return (
    <Stack gap="md" w="100%">
      {!ivg && (
        <Paper p="md" withBorder>
          <Text c="dimmed">Loading IGV viewer...</Text>
        </Paper>
      )}

      {renderProgress()}

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          display: progressState.status === 'complete' ? 'block' : 'none',
        }}
      />
    </Stack>
  );
};

export default IgvBrowser;
