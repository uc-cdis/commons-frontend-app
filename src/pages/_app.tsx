import App, { AppProps, AppContext, AppInitialProps } from 'next/app';
import React, { useEffect } from 'react';

import {
  Gen3Provider,
  TenStringArray,
  type ModalsConfig,
  ContentSource,
  RegisteredIcons,
  Fonts,
  SessionConfiguration,
} from '@gen3/frontend';
import '../styles/globals.css';
// import 'graphiql/graphiql.css';
//import '@graphiql/react/dist/style.css';
import '@fontsource/montserrat';
import '@fontsource/source-sans-pro';
import '@fontsource/poppins';

import { GEN3_COMMONS_NAME, setDRSHostnames } from '@gen3/core';
import drsHostnames from '../../config/drsHostnames.json';

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactDOM = require('react-dom');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}

interface Gen3AppProps {
  colors: Record<string, TenStringArray>;
  icons: RegisteredIcons;
  themeFonts: Fonts;
  modalsConfig: ModalsConfig;
  sessionConfig: SessionConfiguration;
}

const Gen3App = ({
  Component,
  pageProps,
  colors,
  icons,
  themeFonts,
  sessionConfig,
  modalsConfig,
}: AppProps & Gen3AppProps) => {
  useEffect(() => {
    setDRSHostnames(drsHostnames);
  }, []);

  return (
    <Gen3Provider
      colors={colors}
      icons={icons}
      fonts={themeFonts}
      sessionConfig={sessionConfig}
      modalsConfig={modalsConfig}
    >
      <Component {...pageProps} />
    </Gen3Provider>
  );
};

// TODO: replace with page router
Gen3App.getInitialProps = async (
  context: AppContext,
): Promise<Gen3AppProps & AppInitialProps> => {
  const ctx = await App.getInitialProps(context);

  try {
    const modals = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/modals.json`,
    );
    const session = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/session.json`,
    );

    const fonts = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/themeFonts.json`,
    );

    const themeColors = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/themeColors.json`,
    );

    const colors = Object.fromEntries(
      Object.entries(themeColors).map(([key, values]) => [
        key,
        Object.values(values) as TenStringArray,
      ]),
    );

    const icons = await ContentSource.get('config/icons/gen3.json');
    return {
      ...ctx,
      modalsConfig: modals,
      sessionConfig: session,
      themeFonts: fonts as Fonts,
      colors: colors,
      icons: icons as RegisteredIcons,
    };
  } catch (error: any) {
    console.error('Provider Wrapper error loading config', error.toString());
  }
  // return default
  return {
    ...ctx,
    colors: {},
    themeFonts: {
      heading: ['Poppins', 'sans-serif'],
      content: ['Poppins', 'sans-serif'],
      fontFamily: 'Poppins',
    },
    icons: {
      prefix: 'gen3',
      lastModified: 0,
      icons: {},
      width: 0,
      height: 0,
    },
    modalsConfig: {},
    sessionConfig: {},
  };
};
export default Gen3App;
