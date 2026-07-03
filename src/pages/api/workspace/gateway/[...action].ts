import { workspaceGatewayApiHandler } from '@gen3/workspaces/server';

export default workspaceGatewayApiHandler;
export const config = { api: { bodyParser: false } };
