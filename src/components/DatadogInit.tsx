import { datadogRum } from "@datadog/browser-rum";

const ENV = process.env.NODE_ENV;
const DATACOMMONS = process.env.NEXT_PUBLIC_DATACOMMONS || "gen3.2_generic_datacommons";

datadogRum.init({
  applicationId: '3f051d84-4961-4ba6-9b7e-beaeb688337b',
  clientToken: 'pub107488802deb1a3f4d3a8cccbe572897',
  // `site` refers to the Datadog site parameter of your organization
  // see https://docs.datadoghq.com/getting_started/site/
  site: 'ddog-gov.com',
  service: 'test-for-craig',
  env: `${DATACOMMONS}:${ENV}`,
  // version: '1.0.0',
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
