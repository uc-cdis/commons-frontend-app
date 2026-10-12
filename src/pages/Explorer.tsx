import React, { useMemo } from 'react';
import {
  ExplorerPage,
  ExplorerPageGetServerSideProps as getServerSideProps,
} from '@gen3/frontend';

import { registerCohortTableCustomCellRenderers } from '@/lib/CohortBuilder/CustomCellRenderers';
import { registerCustomExplorerDetailsPanels } from '@/lib/CohortBuilder/FileDetailsPanel';
import {
  ExplorerChartsPortal,
  ExplorerTabCharts,
  parseExplorerCharts,
} from '@/lib/charts';

registerCohortTableCustomCellRenderers();
registerCustomExplorerDetailsPanels();

type ExplorerProps = React.ComponentProps<typeof ExplorerPage>;

/** The framework Explorer page, with our charts portalled into each tab. */
const Explorer = (props: ExplorerProps) => {
  const tabs = useMemo(() => parseExplorerCharts(props.explorerConfig), [props.explorerConfig]);
  return (
    <>
      <ExplorerPage {...props} />
      {tabs.map((tab) => (
        <ExplorerChartsPortal key={tab.tabTitle} tabTitle={tab.tabTitle}>
          <ExplorerTabCharts {...tab} />
        </ExplorerChartsPortal>
      ))}
    </>
  );
};

export default Explorer;

export { getServerSideProps };
