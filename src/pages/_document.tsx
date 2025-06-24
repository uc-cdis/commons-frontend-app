import React from 'react';
import { Head, Html, Main, NextScript } from 'next/document';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';

export default function Document() {
  return (
    <Html lang="en" {...mantineHtmlProps}>
      <Head>
        <link rel="icon" type="image/png" href="/icons/favicon.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/icons/cadc_32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/icons/cadc_48x48.png" sizes="48x48" />
        <link rel="icon" type="image/png" href="/icons/cadc_64x64.png" sizes="64x64" />
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <body>
      <Main />
      <NextScript />
      </body>
    </Html>
  );
}
