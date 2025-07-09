import React, { useState } from 'react';
import { Title, Anchor } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
  ProtectedContent,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import TeamProjectHeader from '../lib/AnalysisApps/SharedUtils/TeamProject/TeamProjectHeader/TeamProjectHeader';

const OHDSIAtlas = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const [selectedTeamProject] = useState(
    localStorage.getItem('teamProject') || '',
  );
  const iframeUrl = `https://atlas.${window.location.hostname}/WebAPI/user/login/openid?redirectUrl=/home?teamproject=${selectedTeamProject}`;

  const userRefreshEvent = new Event("updateUserActivity");
  
  const processAppMessages = (event: MessageEvent) => {
    const pathArray = iframeUrl.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    const applicationBaseUrl = `${protocol}//${host}`;

    // ONLY process messages coming from the same domain as the app AND
    // which contain the message "refresh token!":
    if (
      event.origin === applicationBaseUrl
      && event.data === 'refresh token!'
    ) {
      // This refreshes the user token
      window.dispatchEvent(userRefreshEvent);
    }
  };

  // this will ensure the main window will process the app messages (if any):
  window.addEventListener('message', processAppMessages);
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'OHDSI Atlas',
        content: 'OHDSI Atlas Page',
        key: 'gen3-ohdsi-atlas',
      }}
    >
      <ProtectedContent>
        <div className="w-full mx-10 relative flex flex-col">
          <div>
            <Anchor component={Link} href="/resource-browser"> ← Back to Apps</Anchor>
            <div className="flex justify-between pb-4">
              <Title order={1}>OHDSI Atlas</Title>
              <TeamProjectHeader isEditable={false} />
            </div>
            <p>Use this App for cohort creation. These will be automatically populated in the Gen3 GWAS App</p>
          </div>
          <iframe
            className='w-full h-full'
            title='OHDSI Atlas App'
            src={iframeUrl}
          />
        </div>
      </ProtectedContent>
    </NavPageLayout>
  );
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

export default OHDSIAtlas;
