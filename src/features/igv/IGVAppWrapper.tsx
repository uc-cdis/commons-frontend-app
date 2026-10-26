import type { IgvBrowserConfiguration } from './types';
import { useGetBAMAndBAIFileFromGUID } from './hooks';
import { Loader } from '@mantine/core';
import IGVBrowser from './IGVBrowser';
import React from 'react';

// Route through the Next.js proxy when the bucket has no CORS rule (dev only,
// or set NEXT_PUBLIC_IGV_USE_PROXY=true).
const useProxy =
  process.env.NEXT_PUBLIC_IGV_USE_PROXY === 'true' ||
  (process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_IGV_USE_PROXY !== 'false');

const proxied = (url: string) =>
  useProxy ? `/api/igv-proxy?url=${encodeURIComponent(url)}` : url;

interface IGVAppPageProps {
  bamId: string;
  configuration: IgvBrowserConfiguration;
}

const IGVAppWrapper = ({ bamId, configuration }: IGVAppPageProps) => {
  const { bamUrl, baiUrl, isFetching, isSuccess, isError } =
    useGetBAMAndBAIFileFromGUID(bamId);

  if (isError) return <div className="w-full m-10">Error fetching data</div>;
  if (isFetching)
    return (
      <div className="w-full m-10">
        <Loader />
      </div>
    );
  if (isSuccess && bamUrl && baiUrl)
    return (
      <IGVBrowser
        bamUrl={proxied(bamUrl.url)}
        baiUrl={proxied(baiUrl.url)}
        genome={configuration.genome}
        locus={configuration.locus}
        track={configuration.track}
        showDefaultTracks={configuration.showDefaultTracks}
      />
    );

  return null;
};

export default IGVAppWrapper;
