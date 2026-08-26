import React from 'react';
import type { Preview } from '@storybook/nextjs';
import { MantineProvider } from '@mantine/core';
import { GEN3_API, GEN3_AUTHZ_API, GEN3_FENCE_API } from '@gen3/core';
import { Gen3Provider } from '@gen3/frontend';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { http, HttpResponse } from 'msw';
import theme from './mantineTheme';
import icons from './loadIcons';

import '../src/styles/globals.css';
import '@fontsource/montserrat';
// source-sans-pro is frozen at a fontsource build that ships no `types`/`exports`,
// unlike montserrat/poppins — import the stylesheet directly so it type-resolves.
import '@fontsource/source-sans-pro/index.css';
import '@fontsource/poppins';
/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize({}, [
  http.get(`${GEN3_API}/_status`, () => {
    return HttpResponse.json({
      message: 'Feeling good with storybook!',
      csrf: '6640e4857e5cb3b42db303d8ee3a4ace11900.0002025-06-17T15:24:53+00:00',
    });
  }),
  http.get(`${GEN3_AUTHZ_API}/mapping`, () => {
    return HttpResponse.json({});
  }),
  http.get(`${GEN3_FENCE_API}/user`, () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),
]);

const modalsConfig = {
  systemUseModal: {
    enabled: false,
    content: {
      text: [],
    },
  },
};

const sessionConfig = {
  updateSessionTime: 5,
  inactiveTimeLimit: 20,
  logoutInactiveUsers: false,
  monitorWorkspace: false,
};

const protectecRoutes = {
  routes: {
    '/DataLibrary': {
      loginRequired: true,
    },
    '/Workspace': {
      loginRequired: true,
    },
    '/Profile': {
      loginRequired: true,
    },
    '*': {
      loginRequired: false,
    },
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MantineProvider theme={theme}>
        <Gen3Provider
          icons={icons}
          sessionConfig={sessionConfig}
          modalsConfig={modalsConfig}
          protectedRoutesConfig={protectecRoutes}
        >
          <Story />
        </Gen3Provider>
      </MantineProvider>
    ),
  ],
  loaders: [mswLoader], // 👈 Adds the MSW loader to all stories
};

export default preview;
