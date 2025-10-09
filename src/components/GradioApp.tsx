import React from 'react';
import Script from 'next/script';

const GradioApp = ({ app }: { app: string }) => {
  return (
    <>
      <Script
        type="module"
        src="https://gradio.s3-us-west-2.amazonaws.com/5.47.1/gradio.js"
        strategy="lazyOnload"
      />

      <div className="m-2 w-full">
        <gradio-app src={`https://${app}.hf.space`}></gradio-app>
      </div>
    </>
  );
};

export default GradioApp;
