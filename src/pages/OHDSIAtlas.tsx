import React from 'react';
import { Title } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
  ProtectedContent,
} from '@gen3/frontend';
import { useLazyFetchUserDetailsQuery, GEN3_API } from '@gen3/core';
import { GetServerSideProps } from 'next';

const OHDSIAtlas = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const iframeUrl = `https://atlas.${window.location.hostname}/WebAPI/user/login/openid?redirectUrl=/home`;
  const [fetchUserDetails] = useLazyFetchUserDetailsQuery();
  
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
      fetchUserDetails();
    }
  };

  // this will ensure the main window will process the app messages (if any):
  window.addEventListener('message', processAppMessages);
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'OHDSI Atlas',
        content: 'OHDSI Atlas Page',
        key: 'gen3-ohdsi-atlas',
      }}
    >
      <ProtectedContent>
        <div className="w-full mx-10 relative flex flex-col">
          <div>
            <Title order={1}>OHDSI Atlas</Title>
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
