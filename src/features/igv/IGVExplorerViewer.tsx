import type { IgvBrowserConfiguration } from '@/features/igv/types';
import { useRouter } from 'next/dist/client/router';
import { Button, Group, Stack } from '@mantine/core';
import IGVBrowserWrapper from '@/features/igv/IGVBrowserWrapper';
import React from 'react';

export interface IGVExplorerViewerProps {
  bamId: string;
  returnData: string;
  configuration: IgvBrowserConfiguration;
}

/* A BAM viewer designed to be run from the Explorer page */

const IGVExplorerViewer = ({
  bamId,
  returnData,
  configuration,
}: IGVExplorerViewerProps) => {
  const router = useRouter();

  return (
    <div className="w-full m-10">
      <Stack>
        <Group justify="flex-start">
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              router.push(`${'/Explorer?activeTab=' + returnData}`)
            }
          >
            Return To Data Files
          </Button>
        </Group>

        <IGVBrowserWrapper bamId={bamId} configuration={configuration} />
      </Stack>
    </div>
  );
};

export default IGVExplorerViewer;
