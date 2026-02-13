import React from 'react';
import { useGetDownloadQuery } from '@gen3/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';
import { NextRouter, useRouter } from 'next/dist/client/router';

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

const IGVPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const router = useRouter();
  console.log(router.query);
  const bamId = getBamFileURL(router);

  const { data, isFetching, isSuccess, isError } = useGetDownloadQuery(bamId);

  if (isFetching) return <Loading />

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
          <IGVBrowser bamUrl={data.url} />
        </div>
      </NavPageLayout>
    );
  if (isError)
    return <div>Error fetching data</div>;

  return null;
};

// TODO: replace this with a custom getServerSideProps function
export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default IGVPage;
