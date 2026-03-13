import React from 'react';
import type { Preview } from '@storybook/nextjs';
import { MantineProvider, mergeThemeOverrides } from '@mantine/core';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { TenStringArray, createMantineTheme } from '@gen3/frontend';
import { initialize, mswLoader } from 'msw-storybook-addon';

import '../src/styles/globals.css';
import '@fontsource/montserrat';
import '@fontsource/source-sans-pro';
import '@fontsource/poppins';
const themeColors: Record<string, TenStringArray> = require(`../config/${GEN3_COMMONS_NAME}/themeColors.json`);




const gen3ThemeDynamic = createMantineTheme(
  {
    heading: ['Poppins', 'sans-serif'],
    content: ['Poppins', 'sans-serif'],
    fontFamily: 'Poppins',
  },
  themeColors
);
const mantineTheme = mergeThemeOverrides(gen3ThemeDynamic);

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

const preview: Preview = {
  parameters: {
    a11y: {
      // Set the test parameter to 'error' to fail on violations
      test: 'error',
    },
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
      <MantineProvider theme={mantineTheme}>
        <Story />
      </MantineProvider>
    ),
  ],
  loaders: [mswLoader], // 👈 Adds the MSW loader to all stories
};

export default preview;
