import React from 'react';
import type { GetServerSideProps } from 'next';
import type { NextRouter} from 'next/dist/client/router';
import { useRouter } from 'next/dist/client/router';

import type {
  NavPageLayoutProps} from '@gen3/frontend';
import {
  NavPageLayout,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';

const AppsPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const router = useRouter();
  const notebook = getNotebookName(router);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Notebook Page',
        content: 'Jupyter Notebook',
        key: 'gen3-notebook-page',
      }}
    >
      <div className="flex justify-items-center w-full">
        <iframe
          allow="cross-origin"
          src={`${router.basePath}/jupyter/lab/index.html?path=${notebook}`}
          width="100%"
          height="100%"
          title="client notebook"
         />
      </div>
    </NavPageLayout>
  );
};

const getNotebookName = (router: NextRouter): string => {
  const { notebook } = router.query;
  if (typeof notebook === 'string') return notebook;
  else if (typeof notebook === 'object') return notebook[0];

  return 'notFound';
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
      },
    };
  }
};

export default AppsPage;
