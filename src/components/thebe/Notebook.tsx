'use_client'
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  ThebeBundleLoaderProvider,
  ThebeServerProvider,
  ThebeSessionProvider,
  ThebeRenderMimeRegistryProvider, useThebeServer,
} from 'thebe-react';
import { shortId } from 'thebe-core';
import { Connect } from './Connect';

const WidgetsPage = dynamic(() => import('./WidgetsPage'), {
  ssr: false,
});


const NotebookWithWidget = () => {

  const { connecting, ready, config, error } = useThebeServer();

  console.log("NotebookWithWidget", connecting, ready, config, error);
  if (!connecting && !ready && !error) return null;
  return (
    <ThebeRenderMimeRegistryProvider>
      <ThebeSessionProvider
        start
        path={config?.kernels.path}
      >

        <WidgetsPage notebookName={"primary_analyses"} />
      </ThebeSessionProvider>
    </ThebeRenderMimeRegistryProvider>
  )
}



const Notebook = () => {
  const path = location.pathname.endsWith('path-test') ? '/notebooks' : '/';

  const options = useMemo(
    () => ({
      kernelOptions: {
        path,
        kernelName: 'python',
      },
      binderOptions: {
        repo: 'executablebooks/thebe-binder-base',
      },
      serverSettings: {
        token: shortId(),
      }
    }),
    [path],
  );

  return (
    <ThebeBundleLoaderProvider loadThebeLite publicPath="/thebe">
      <ThebeServerProvider
        connect={false}
        options={options}
        useBinder={false}
        useJupyterLite={true}
      >
        <Connect />
   <NotebookWithWidget />
      </ThebeServerProvider>
    </ThebeBundleLoaderProvider>
  );
};

export default Notebook;
