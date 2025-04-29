/** @type {import('tailwindcss').Config} */
/* eslint-disable @typescript-eslint/no-var-requires */

const plugin = require('tailwindcss/plugin');
/* eslint-disable @typescript-eslint/no-var-requires */
const { GEN3_COMMONS_NAME } = require('@gen3/core');
const themeColors = require(`./config/${GEN3_COMMONS_NAME}/themeColors.json`);
const themeFonts = require(`./config/${GEN3_COMMONS_NAME}/themeFonts.json`);

module.exports = {
  content: [
    './src/lib/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
    './node_modules/@gen3/frontend/dist/esm/index.js',
  ],
  theme: {
    extend: {
      colors: {
        vadc: {
          primary: '#2e77b8',
          secondary: '#2466ac',
          tertiary: '#cfdbe6',
          slate_blue: '#e9eef2',
          border: '#dedede',
          alternate_row: '#fafafb',
          gold: '#a35b18',
        },
        heal: {
          primary: '#99286B',
          secondary: '#402264',
          light_purple: '#F6EFF1',
          purple: '#532565',
          magenta: '#982568',
          red: '#981F32',
          coral: '#BF362E',
          orange: '#E07C3E',
          dark_gray: '#373A3C',
          medium_gray: '#818A91',
          light_gray: '#DDDDDD',
          blue: '#0044B3',
        },
        midrc: {
          secondary: '#421C52',
        },
        gen3: {
          secondary: '#3283C8',
          primary: '#05B8EE',
          lime: '#7EC500',
          iris: '#AD91FF',
          rose: '#E74C3C',
          bee: '#F4B940',
          pink: '#FF7ABC',
          highlight_orange: '#EF8523',
          highlight_orange_light: '#FF9635',
          mint: '#26D9B1',
          coal: '#4A4A4A',
          cloud: '#F5F5F5',
          gray: '#606060',
          lightgray: '#9B9B9B',
          smoke: '#D1D1D1',
          silver: '#E7E7E7',
          black: '#000000',
          white: '#FFFFFF',
          titanium: '#707070',
          obsidian: '#757575',
        },
        ...themeColors,
      },
      fontFamily: {
        heading: themeFonts.heading,
        content: themeFonts.content,
      },
      fontSize: {
        tiny: '0.625rem',
      },
      borderWidth: {
        DEFAULT: '1px',
        0: '0',
        1: '1px',
        2: '2px',
        3: '3px',
        4: '4px',
        6: '6px',
        8: '8px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    plugin(function ({ addVariant }) {
      // add mantine.dev variants
      addVariant('api-checked', '&[api-checked]');
      addVariant('api-active', '&[api-active]');
      addVariant('api-selected', '&[api-selected]');
      addVariant('api-hovered', '&[api-hovered]');
      addVariant('api-disabled', '&[api-disabled]');
      addVariant('api-in-range', '&[api-in-range]');
      addVariant('api-first-in-range', '&[api-first-in-range]');
      addVariant('api-last-in-range', '&[api-last-in-range]');
    }),
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        '.nextImageFillFix': {
          width: 'auto !important',
          right: 'auto !important',
          'min-width': '0 !important',
        },
      };
      addUtilities(newUtilities);
    }),
    plugin(function ({ addComponents }) {
      // TODO remove these
      addComponents({
        '.heal-btn': {
          display: 'inline-block',
          textAlign: 'center',
          padding: '0.375rem 1rem',
          fontSize: '1rem',
          lineHeight: '1.5',
          fontWeight: '600',
          textTransform: 'uppercase',
          color: '#ffffff',
          border: '4px solid transparent',
          borderRadius: '7px',
          backgroundColor: '#982568',
          '&:hover, &:focus': {
            backgroundColor: '#ffffff',
            borderColor: '#982568',
            color: '#982568',
          },
        },
        '.heal-btn-purple': {
          backgroundColor: '#532565',
          '&:hover, &:focus': {
            color: '#532565',
            borderColor: '#532565',
            backgroundColor: '#ffffff',
          },
        },
        '.heal-btn-rev': {
          color: '#982568',
          borderColor: '#982568',
          backgroundColor: '#ffffff',
          '&:hover, &:focus': {
            backgroundColor: '#982568',
            borderColor: 'transparent',
            color: '#ffffff',
          },
        },
        '.heal-link-footer': {
          color: '#FFFFFF',
          '&:hover, &:focus': {
            color: '#c0b3c5',
          },
        },
      });
    }),
  ],
  safelist: [
    'accent-warm',
    'text-tiny',
    'text-xxs',
    'text-xxxs',
    'h-20',
    {
      pattern:
        /bg-(primary|secondary|accent|accent-warm|accent-cool|base)-(min|lightest|lighter|light|dark|darker|darkest|max)/,
    },
    {
      pattern:
        /text-(primary|secondary|accent|accent-warm|accent-cool|base)-(min|lightest|lighter|light|dark|darker|darkest|max)/,
    },
    {
      pattern:
        /border-(primary|secondary|accent|accent-warm|accent-cool|base)-(min|lightest|lighter|light|dark|darker|darkest|max)/,
    },
    {
      pattern: /bg-(primary|secondary|accent|accent-warm|accent-cool|base)/,
    },
    {
      pattern: /text-(primary|secondary|accent|accent-warm|accent-cool|base)/,
    },
    {
      pattern: /border-(primary|secondary|accent|accent-warm|accent-cool|base)/,
    },
  ],
};
