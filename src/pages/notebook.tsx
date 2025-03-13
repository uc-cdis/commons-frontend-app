import React, { useState, useEffect } from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';


const NotebookViewer = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    async function fetchHtml() {
      const response = await fetch('/notebooks/PDC_clustergram.html');
      const text = await response.text();
      setHtmlContent(text);
    }
    fetchHtml();
  }, []);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Notebook Viewer',
        content: 'Static Notebook',
        key: 'gen3-notebook-viewer-page',
      }}
    >
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};


 export default NotebookViewer;
