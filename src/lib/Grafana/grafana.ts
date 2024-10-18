import {
  getWebInstrumentations,
  initializeFaro,
  ReactIntegration,
} from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// Get the current, runtime version of the App to surface to Faro
// import packageJson from "../../package.json";

export const initGrafanaFaro = () => {
  return initializeFaro({
    url: 'https://faro.planx-pla.net/collect',

    app: {
      // TODO: Populate with real values.
      name: 'gen3-frontend-framework',
      //   version: packageJson.version,
      version: '10.0.0',
      environment: 'local',
    },

    instrumentations: [
      // load the mandatory web instrumentation
      ...getWebInstrumentations({
        captureConsole: true,
      }),

      // add tracing instrumentation which should include the React Profiler
      new TracingInstrumentation(),

      new ReactIntegration({
        // In the future, we may choose to integrate with React router instrumentation to
        // get deeper metrics on matched routes, navigation types, etc.
        // Next/router doesn't seem to be supported which won't give us route metrics.
        //
        // Reference: https://github.com/grafana/faro-web-sdk/tree/main/packages/react
        //
        // router: {}
      }),
    ],
  });
};
