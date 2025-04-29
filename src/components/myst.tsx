import React from "react";
import {ArticleProvider,  ReferencesProvider, ThemeProvider } from '@myst-theme/providers';
import { MyST, DEFAULT_RENDERERS } from 'myst-to-react';
import { Box } from "@mantine/core";

export function MyComponent({ data }) {

  const { mdast, frontmatter, references } = data
  return (
    <ReferencesProvider references={references} frontmatter={frontmatter}>
      <ThemeProvider renderers={DEFAULT_RENDERERS}>
        <Box style={{ maxWidth: '800px', margin: 'auto', padding: 3 }}>
          <MyST ast={mdast.children} />
        </Box>
      </ThemeProvider>
    </ReferencesProvider>
);
}
