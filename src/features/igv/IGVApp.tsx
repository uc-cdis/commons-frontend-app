import React from 'react';
import { useRouter } from 'next/dist/client/router';
import type { IgvBrowserConfiguration } from './types';
import type { NextRouter } from 'next/router';
import IGVExplorerViewer from './IGVExplorerViewer';
import IGVBamPicker from './IGVBamPicker';

interface IGVAppProps {
  bamId: string;
  mode: string;
  returnData: string;
}
const getBamFileURL = (router: NextRouter): Partial<IGVAppProps> => {
  const { bam, mode, returnData } = router.query;

  return {
    bamId: typeof bam === 'object' ? bam[0] : bam,
    mode: typeof mode === 'object' ? mode[0] : mode,
    returnData: typeof returnData === 'object' ? returnData[0] : returnData,
  };
};

const IGVApp = (configuration: IgvBrowserConfiguration) => {
  const router = useRouter();
  const { bamId, mode, returnData } = getBamFileURL(router);

  if (mode == 'explorer') {
    return (
      <IGVExplorerViewer
        bamId={bamId ?? ''}
        configuration={configuration}
        returnData={returnData ?? ''}
      />
    );
  }
  if (mode === 'app') {
    return <IGVBamPicker configuration={configuration} />;
  }
};

export default IGVApp;
