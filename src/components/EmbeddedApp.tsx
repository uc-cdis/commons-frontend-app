import React from 'react';
import Script from 'next/script';

const EmbeddedApp = ({ app }: { app: string }) => {
  const url = new URL(`https://${app}`);
  const isGradio = url.searchParams.get('type') === 'gradio';

  if (isGradio) {
    return (
      <>
        <Script
          type="module"
          src="https://gradio.s3-us-west-2.amazonaws.com/5.47.1/gradio.js"
          strategy="lazyOnload"
        />

        <div className="m-2 w-full">
          <gradio-app src={`https://${app}`}></gradio-app>
        </div>
      </>
    );
  }

  return (
    <div className="m-2 w-full">
      <iframe
        src={`https://${app}`}
        className="w-full h-full"
      />
    </div>
  );
};

export default EmbeddedApp;
