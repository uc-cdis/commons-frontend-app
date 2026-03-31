import {
  DiscoveryPage,
  DiscoveryPageGetServerSideProps as getServerSideProps,
} from '@gen3/frontend';
import { registerDiscoveryCustomCellRenderers } from '@/lib/Discovery/CustomCellRenderers';

registerDiscoveryCustomCellRenderers();

export default DiscoveryPage;

export { getServerSideProps };
