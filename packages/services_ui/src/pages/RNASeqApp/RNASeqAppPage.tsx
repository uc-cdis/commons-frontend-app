import type { JSX } from 'react';
import React from 'react';
import { FixedNavPageLayout } from '@gen3/frontend';
import type { RNASeqPageLayoutProps } from './types';
import {RNASeqEmbeddingsApp} from "../../features/RNAseqEmbeddings";

const RNASeqAppPage = ({
  headerProps,
  footerProps,
  configuration,
}: RNASeqPageLayoutProps): JSX.Element => {
  return (
    <FixedNavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'RNA Sequence Embeddings App',
        content: 'RNA Sequence App',
        key: 'rna-sequence-page',
        ...(configuration?.headerMetadata ? configuration.headerMetadata : {}),
      }}
    >
      <RNASeqEmbeddingsApp demoFilesUrl={configuration?.demoFilesUrl} />
    </FixedNavPageLayout>
  );
};

export default RNASeqAppPage;
