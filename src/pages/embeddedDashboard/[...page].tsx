import React, { useEffect, useRef, useState } from 'react';
import type { GetServerSideProps } from 'next';
import type { NextRouter} from 'next/dist/client/router';
import { useRouter } from 'next/dist/client/router';
import { getNavPageLayoutPropsFromConfig } from '@gen3/frontend';
import {
  NavPageLayout,
  type NavPageLayoutProps,
} from '@gen3/frontend';

const DashboardContentApp = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps) => {
  const router = useRouter();
  const path = getDashboardPath(router);
  const [urlStatus, setUrlStatus] = useState<'loading' | 'valid' | 'notfound'>(
    'loading',
  );

  const iframeRef = useRef<HTMLIFrameElement | null>(null!);

  useEffect(() => {
    const iframe = iframeRef.current;

    const handleLoad = () => {
      try {
        // Access iframe document
        if (iframe) {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;

          // Find all anchor tags and add target="_blank"
          const links = iframeDoc?.querySelectorAll('a');
          links?.forEach((link: any) => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noreferrer');
          });
        }
      } catch (error) {
        console.error('Cannot access iframe content:', error);
      }
    };

    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, []);

  const checkUrl = async () => {
    try {
      const response = await fetch(`${router.basePath}/dashboard/${path}`, {
        method: 'GET',
        headers: {
          Range: 'bytes=0-0',
        },
      });

      if (response.ok) {
        setUrlStatus('valid');
      } else {
        setUrlStatus('notfound');
      }
    } catch (error) {
      console.error('Failed to check dashboard URL:', error);
      await router.replace('/404');
    }
  };

  // Check if the dashboard URL exists
  if (!path) {
    setUrlStatus('notfound');
  } else {
    checkUrl();
  }


  // Show loading state while checking URL
  if (urlStatus === 'loading') {
    return (
      <NavPageLayout
        {...{ headerProps, footerProps }}
        headerMetadata={{
          title: 'Gen3 Dashboard Page',
          content: 'Gen3 Dashboard Content',
          key: 'gen3-dashboard-page',
        }}
      >
        <div className="flex w-full h-full items-center justify-center">
          Loading...
        </div>
      </NavPageLayout>
    );
  }
  //
  // if (urlStatus === 'notfound') {
  //   return <MessageCard message="Notebook not found" />;
  // }

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Dashboard Page',
        content: 'Gen3 Dashboard Content',
        key: 'gen3-dashboard-page',
      }}
    >
      <div className="flex justify-items-center w-full">
        <iframe
          ref={iframeRef}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="geolocation 'none'; microphone 'none'; camera 'none'"
          src={`${router.basePath}/dashboard/${path}`}
          width="100%"
          height="100%"
          title="client notebook"
        />
      </div>
    </NavPageLayout>
  );
};

const getDashboardPath = (router: NextRouter): string | null => {
  const { page: dashboard } = router.query;

  if (typeof dashboard === 'string') return dashboard;
  else if (typeof dashboard === 'object') return dashboard.join('/');

  return null;
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

export default DashboardContentApp;
