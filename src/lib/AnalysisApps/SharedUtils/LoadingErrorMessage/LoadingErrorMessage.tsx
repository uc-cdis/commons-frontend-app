import React from 'react';

const LoadingErrorMessage = ({ message = 'Error loading data for table' }: {message?:string}) => (
  <h2 className='loading-error-message' data-testid='loading-error-message'>
        ❌ {message}
  </h2>
);

export default LoadingErrorMessage;
