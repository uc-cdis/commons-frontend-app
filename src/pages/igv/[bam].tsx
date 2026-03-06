import React from 'react';
import { GEN3_COMMONS_NAME, useGetDownloadQuery } from '@gen3/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig, ContentSource,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';
import { Button, Stack } from '@mantine/core';
import { NextRouter, useRouter } from 'next/dist/client/router';
import { IgvBrowserConfiguration } from '@/components/genomic/types';

const getBamFileURL = (router: NextRouter): string => {
  const { bam } = router.query;
  if (typeof bam === 'string') return bam;
  else if (typeof bam === 'object') return bam[0];

  return 'notFound';
};

const IGVBrowser = dynamic(() => import('@/components/genomic/IgvBrowser'), {
  ssr: false,
  loading: () => <div>Loading IGV viewer...</div>,
});

interface IGVPageProps extends NavPageLayoutProps {
  configuration: IgvBrowserConfiguration
};

const IGVPage = ({ headerProps, footerProps, configuration }: IGVPageProps) => {
  const router = useRouter();
  const bamId = getBamFileURL(router);

  const { data, isFetching, isSuccess, isError } = useGetDownloadQuery(bamId);

  if (isFetching) return <Loading />;

  if (isSuccess && data)
    return (
      <NavPageLayout
        {...{ headerProps, footerProps }}
        headerMetadata={{
          title: 'Gen3 IGV Browser Page',
          content: 'IGV Viewer',
          key: 'gen3-igv-page',
        }}
      >
        <div className="w-full m-10">
          <Stack>
            <Button variant="contained" color="primary" onClick={() => router.push('/Explorer')}>Return to Explorer</Button>
            <IGVBrowser bamUrl={data.url} genome={configuration.genome} locus={configuration.locus} track={configuration.track} showDefaultTracks={configuration.showDefaultTracks}/>
          </Stack>
        </div>
      </NavPageLayout>
    );
  if (isError) return <div>Error fetching data</div>;

  return null;
};

export const getServerSideProps: GetServerSideProps<IGVPageProps> = async () => {


  try {
    const configuration: IgvBrowserConfiguration =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/apps/igvViewer.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration,
      },
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn('igvViewer config cannot be read', err);
    }
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: {
          genome: 'hg38',
          locus: 'chr1:100000-200000',
          track: {
            name: 'Canine OSA Genes',
            type: 'annotation',
            format: 'gff3',
            url: '/canine/Canis_familiaris.CanFam3.1.98.sorted.gff3.gz',
            indexURL:
              '/canine/Canis_familiaris.CanFam3.1.98.sorted.gff3.gz.tbi',
            displayMode: 'EXPANDED',
            color: '#005a9c',
          },
          showDefaultTracks: true,
        },
      },
    };
  }



};

export default IGVPage;
