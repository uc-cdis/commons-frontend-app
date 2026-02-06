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

const IGVBrowser = dynamic(() => import('@/components/genomic/IgvBrowser'), {
  ssr: false,
  loading: () => <div>Loading IGV viewer...</div>,
});

const IGVPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {

  const { data, isFetching, isSuccess, isError } = useGetDownloadQuery(
    '0576ed72-7633-43ba-86f0-7b33eb836fb6',
  );

  if (isFetching) return <Loading />

  if (isSuccess && data)
    return (
      <NavPageLayout
        {...{ headerProps, footerProps }}
        headerMetadata={{
          title: 'Gen3 Sample Page',
          content: 'Sample Data',
          key: 'gen3-sample-page',
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
