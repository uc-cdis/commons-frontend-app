import React from 'react';
import {
  useCoreSelector,
  selectGen3AppByName,
  GEN3_COMMONS_NAME,
} from '@gen3/core';
import { GetServerSideProps } from 'next';
import { NextRouter, useRouter } from 'next/dist/client/router';

import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
  ContentSource,
} from '@gen3/frontend';

interface AppConfig extends NavPageLayoutProps {
  config?: object;
}

const AppsPage = ({ headerProps, footerProps, config }: AppConfig) => {
  const router = useRouter();
  const appName = getAppName(router);

  const GdcApp = useCoreSelector(
    () => selectGen3AppByName(appName), // TODO update ById to ByName
  ) as React.ElementType;

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 App Page',
        content: 'App Data',
        key: 'gen3-app-page',
      }}
    >
      {GdcApp && <GdcApp {...config} />}
    </NavPageLayout>
  );
};

const getAppName = (router: NextRouter): string => {
  const { appName } = router.query;
  if (typeof appName === 'string') return appName;
  else if (typeof appName === 'object') return appName[0];

  return 'UNKNOWN_APP_ID';
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (context) => {
  const appName = context.query.appName as string;

  try {
    const config: any = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/apps/${appName}.json`,
    );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: config,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: undefined,
      },
    };
  }
};

export default AppsPage;
