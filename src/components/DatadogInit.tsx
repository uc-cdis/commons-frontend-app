import { datadogRum } from '@datadog/browser-rum';

interface DatadogInitProps {
  appId: string;
  clientToken: string;
  dataCommons: string;
}

const DatadogInit = ({ appId, clientToken, dataCommons }: DatadogInitProps) => {
  // Render nothing - this component is only included so that the init code
  // will run client-side

  datadogRum.init({
    applicationId: appId,
    clientToken: clientToken,
    site: 'ddog-gov.com',
    service: 'frontend-framework',
    env: `${dataCommons}`,
    version: process.env.version || 'unknown',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 0,
    defaultPrivacyLevel: 'mask-user-input',
  });

  return null;
};

export default DatadogInit;
