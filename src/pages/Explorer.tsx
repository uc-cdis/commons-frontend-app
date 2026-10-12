import React from 'react';
import {
  ExplorerPage,
  ExplorerPageGetServerSideProps as getServerSideProps,
} from '@gen3/frontend';

import { registerCohortTableCustomCellRenderers } from '@/lib/CohortBuilder/CustomCellRenderers';
import { registerCustomExplorerDetailsPanels } from '@/lib/CohortBuilder/FileDetailsPanel';
import { PortalCharts } from '@/lib/charts/spike/PortalCharts';
import { SpikeChart } from '@/lib/charts/spike/SpikeChart';

registerCohortTableCustomCellRenderers();
registerCustomExplorerDetailsPanels();

// SPIKE: route B on the Donors tab
const SpikeExplorerPage = (props: React.ComponentProps<typeof ExplorerPage>) => (
  <>
    <ExplorerPage {...props} />
    <PortalCharts tabTitle="Donors">
      <SpikeChart
        route="B-portal"
        index="donor"
        field="menopausal_status"
        title="Menopausal Status"
      />
    </PortalCharts>
  </>
);

export default SpikeExplorerPage;

export { getServerSideProps };
