import { workspaceAssetsApi } from '@gen3/workspaces/server';

export default workspaceAssetsApi;

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '12mb',
  },
};
