import App, { AppProps, AppContext, AppInitialProps } from 'next/app';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { MantineProvider, mergeThemeOverrides } from '@mantine/core';

import {
  type AuthorizedRoutesConfig,
  createMantineTheme,
  DefaultAuthorizedRoutesConfig,
  Gen3Provider,
  type ModalsConfig,
  registerCohortDiscoveryApp,
  RegisteredIcons,
  registerMetadataSchemaApp,
  registerIGVApp,
  SessionConfiguration,
  TenStringArray,
  Fonts,
} from '@gen3/frontend';
import { registerDefaultRemoteSupport, setDRSHostnames } from '@gen3/core';

import { registerCohortTableCustomCellRenderers } from '@/lib/CohortBuilder/CustomCellRenderers';

import '../styles/globals.css';
import '@fontsource/montserrat';
import '@fontsource/source-sans-pro';
import '@fontsource/poppins';

import drsHostnames from '../../config/drsHostnames.json';
import { loadContent } from '@/lib/content/loadContent';
import Loading from '../components/Loading';
import DatadogInit from '@/components/DatadogInit';

const safeRun = (name: string, fn: () => void) => {
  try {
    fn();
  } catch (error) {
    console.error(`Gen3 runtime init error in ${name}`, error);
  }
};

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const ReactDOM = require('react-dom');
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}

type PublicConfig = {
  dataDogAppId: string | null;
  dataDogClientToken: string | null;
  dataCommons: string;
};

interface Gen3AppProps {
  icons: Array<RegisteredIcons>;
  modalsConfig: ModalsConfig;
  sessionConfig: SessionConfiguration;
  protectedRoutes: AuthorizedRoutesConfig;
  publicConfig?: PublicConfig;
  colors: Record<string, TenStringArray>;
  fonts: Fonts;
}

const getTabTitle = (asPath: string): string => {
  const path = asPath.split('?')[0]?.split('#')[0] || '/';

  if (path === '/' || path === '/index') return 'Vectis Home';
  if (path === '/Discovery') return 'Vectis Discovery';
  if (path === '/DataDictionary') return 'Vectis Dictionary';
  if (path === '/Explorer') return 'Vectis Exploration';
  if (path === '/Query') return 'Vectis Query';
  if (path === '/Analysis') return 'Vectis Apps';
  if (path === '/Workspace') return 'Vectis Workspace';
  if (path === '/workspaces/jupyter') return 'Jupyter Workspace | Vectis';
  if (path === '/workspaces/jupyter-kernel') return 'Jupyter Kernel Workspace | Vectis';
  if (path === '/workspaces/jupyter-lite') return 'Jupyter Lite Workspace | Vectis';
  if (path === '/Submission') return 'Vectis Browse Data';
  if (path === '/DataLibrary') return 'Vectis Data Library';
  if (path === '/Profile') return 'Vectis Profile';
  if (path.startsWith('/app/')) return 'Vectis App';
  if (path.startsWith('/notebook/')) return 'Vectis Notebook';
  if (path.startsWith('/staticNotebook/')) return 'Vectis Static Notebook';

  return 'Vectis Home';
};

const Gen3App = ({
  Component,
  pageProps,
  icons,
  colors,
  fonts,
  sessionConfig,
  modalsConfig,
  protectedRoutes,
  publicConfig,
}: AppProps & Gen3AppProps) => {
  const router = useRouter();
  const isFirstRender = useRef(true);

  // Build theme synchronously so MantineProvider has a valid theme on first render.
  // This prevents CSS loss when a page component errors before useEffect fires.
  const computeInitialTheme = (): Partial<ReturnType<typeof mergeThemeOverrides>> => {
    try {
      const gen3ThemeDynamic = createMantineTheme(fonts, colors);
      const mergedTheme = mergeThemeOverrides(gen3ThemeDynamic);
      const colorKeys = Object.keys((mergedTheme as any)?.colors ?? {});
      const primary = (mergedTheme as any)?.primaryColor;

      if (colorKeys.length === 0) {
        return {};
      }
      if (!primary || !colorKeys.includes(primary)) {
        const safePrimary = colorKeys.includes('blue') ? 'blue' : colorKeys[0];
        return { ...mergedTheme, primaryColor: safePrimary };
      }
      return mergedTheme;
    } catch (error) {
      console.error('Failed to build theme from content config, using fallback theme', error);
      return {};
    }
  };

  const [mantineTheme, setMantineTheme] =
    useState<Partial<ReturnType<typeof mergeThemeOverrides>>>(computeInitialTheme);

  const ensureRegistrations = () => {
    if (typeof window === 'undefined') return;
    if ((window as any).__GEN3_VECTIS_REGISTRY_INITIALIZED__) return;

    safeRun('setDRSHostnames', () => setDRSHostnames(drsHostnames));
    safeRun('registerDefaultRemoteSupport', () => registerDefaultRemoteSupport());
    safeRun('registerMetadataSchemaApp', () => registerMetadataSchemaApp());
    safeRun('registerCohortDiscoveryApp', () => registerCohortDiscoveryApp());
    safeRun('registerCohortTableCustomCellRenderers', () => registerCohortTableCustomCellRenderers());

    (window as any).__GEN3_VECTIS_REGISTRY_INITIALIZED__ = true;
  };

  useEffect(() => {
    if (isFirstRender.current) {
      ensureRegistrations();
      isFirstRender.current = false;
      console.log('Gen3 App initialized');
    }
  }, []);

  useEffect(() => {
    document.title = getTabTitle(router.asPath);
  }, [router.asPath]);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsClient(false); // Only on client-side
    }
    else
    setIsClient(true); // Only on client-side
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>{getTabTitle(router.asPath)}</title>
      </Head>
      {isClient ? (
        <Suspense fallback={<Loading />}>
          {publicConfig?.dataDogAppId != null &&
            publicConfig?.dataDogClientToken != null && (
              <DatadogInit
                appId={publicConfig.dataDogAppId}
                clientToken={publicConfig.dataDogClientToken}
                dataCommons={publicConfig.dataCommons}
              />
            )}
          <MantineProvider theme={mantineTheme}>
            <Gen3Provider
              icons={icons}
              sessionConfig={sessionConfig}
              modalsConfig={modalsConfig}
              protectedRoutesConfig={protectedRoutes}
            >
              <Component {...pageProps} />
            </Gen3Provider>
          </MantineProvider>
        </Suspense>
      ) : (
        // Show some fallback UI while waiting for the client to load
        <Loading />
      )}
    </React.Fragment>
  );
};

// TODO: replace with page router
Gen3App.getInitialProps = async (
  context: AppContext,
): Promise<Gen3AppProps & AppInitialProps> => {
  const ctx = await App.getInitialProps(context);
  const publicConfig: PublicConfig = {
    dataDogAppId: process.env.DATADOG_APPLICATION_ID || null,
    dataDogClientToken: process.env.DATADOG_CLIENT_TOKEN || null,
    dataCommons: process.env.DATACOMMONS || 'commons_frontend_app',
  };

  try {
    const res = await loadContent();
    return {
      ...ctx,
      ...res,
      publicConfig,
    };
  } catch (error: any) {
    console.error('Provider Wrapper error loading config', error.toString());
  }
  // return default
  return {
    ...ctx,
    icons: [
      {
        prefix: 'gen3',
        lastModified: 0,
        icons: {},
        width: 0,
        height: 0,
      },
    ],
    colors: {},
    fonts: {
      heading: ['Poppins', 'sans-serif'],
      content: ['Poppins', 'sans-serif'],
      fontFamily: 'Poppins',
    },
    modalsConfig: {},
    sessionConfig: {},
    protectedRoutes: DefaultAuthorizedRoutesConfig,
    publicConfig,
  };
};
export default Gen3App;
