import { NextPageContext } from 'next';

interface ErrorPageProps {
  statusCode?: number;
}

const ErrorPage = ({ statusCode }: ErrorPageProps) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        {statusCode ? `Error ${statusCode}` : 'An error occurred'}
      </h1>
      <p>
        {statusCode === 404
          ? 'This page could not be found.'
          : 'Something went wrong. Please try refreshing the page.'}
      </p>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
