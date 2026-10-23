import { createGen3App } from '@gen3/core';
import IGVApp from './IGVApp';

const _APP_NAME = 'IGVBamViewer';
const _APP_VERSION = '1.0.0';

export const registerIGVApp = () =>
  createGen3App({
    App: IGVApp,
    name: _APP_NAME,
    version: _APP_VERSION,
    requiredEntityTypes: [],
  });

export const IGVAppName = _APP_NAME;
