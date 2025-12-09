import { datadogRum } from "@datadog/browser-rum";

const ENV = process.env.NODE_ENV;
const DATACOMMONS = process.env.NEXT_PUBLIC_DATACOMMONS || "gen3.2_generic_datacommons";

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || '',
  clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || '',
  site: 'ddog-gov.com',
  service: 'frontend-framework',
  env: `${DATACOMMONS}:${ENV}`,
  version: process.env.version || 'unknown',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 0,
  defaultPrivacyLevel: 'mask-user-input',
});

const DatadogInit = ()=>  {
  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null;
}

export default DatadogInit;
