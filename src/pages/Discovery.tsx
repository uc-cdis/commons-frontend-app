import {
  DiscoveryPage,
  DiscoveryPageGetServerSideProps as getServerSideProps,
} from '@gen3/frontend';
import { registerDiscoveryCustomCellRenderers } from '@/lib/Discovery/CustomCellRenderers';
import { registerDiscoveryStudyPreviewRenderers } from '@/lib/Discovery/CustomRowRenderers';

registerDiscoveryCustomCellRenderers();
registerDiscoveryStudyPreviewRenderers();

export default DiscoveryPage;

export { getServerSideProps };
