import React, { type ReactElement } from 'react';
import { FixedNavPageLayout } from '@gen3/frontend';
import type { NavPageLayoutProps } from '@gen3/frontend';
import EmbeddingsCatalog from "../../features/embeddings/EmbeddingsCatalog";


const EmbeddingsPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): ReactElement => {
  return (
    <FixedNavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Embeddings Catalog',
        content: 'Gen3 Embeddings Catalog',
        key: 'gen3-embeddings-catalog-page',
      }}
    >
        <div className="p-5 w-full">
          <EmbeddingsCatalog />
        </div>
    </FixedNavPageLayout>
  );
};

export default EmbeddingsPage;
