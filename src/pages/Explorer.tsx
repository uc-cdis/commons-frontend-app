import {
  ExplorerPage,
  ExplorerPageGetServerSideProps as getServerSideProps,
} from '@gen3/frontend';

import { registerCohortTableCustomCellRenderers } from "@/lib/CohortBuilder/CustomCellRenderers";

registerCohortTableCustomCellRenderers();

export default ExplorerPage;

export { getServerSideProps };
