import React, { type ReactElement } from 'react';
import { FixedNavPageLayout } from '@gen3/frontend';
import type { NavPageLayoutProps } from '@gen3/frontend';
import ModelsCatalog from "../../features/models/ModelsCatalog";


const ModelsPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): ReactElement => {
  return (
    <FixedNavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Models Catalog',
        content: 'Gen3 Modesl Catalog',
        key: 'gen3-models-catalog-page',
      }}
    >
        <div className="p-5 w-full">
          <ModelsCatalog />
        </div>
    </FixedNavPageLayout>
  );
};

export default ModelsPage;
