import React, { useContext, useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import { SourcesEndpoint } from './Endpoints';

const SourceContext = createContext();

export function SourceContextProvider({ children }) {

  const fetchSources = async () => {
    const response = await fetch(SourcesEndpoint);
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }
    return response.json();
  };

  const useSourceFetch = () => {
    const [loading, setLoading] = useState(true);
    const [sourceIdFromFetch, setSourceIdFromFetch] = useState(undefined);
    const getSources = () => { // fetch sources on initialization
      fetchSources().then((data) => {
        if (Array.isArray(data?.sources) && data.sources.length === 1) {
          setSourceIdFromFetch(data.sources[0].source_id);
          setLoading(false);
        } else {
          const message = `Data source recieved in an invalid format:
          ${JSON.stringify(data?.sources)}`;
          throw new Error(message);
        }
      });
    };
    useEffect(() => {
      getSources();
    }, []);
    return { loading, sourceIdFromFetch };
  };

  const [sourceId, setSourceId] = useState(undefined);
  const { sourceIdFromFetch } = useSourceFetch();
  useEffect(() => {
    setSourceId(sourceIdFromFetch);
  }, [sourceIdFromFetch]);
  return (
    <SourceContext.Provider
      value={{
        sourceId,
      }}
    >
      {children}
    </SourceContext.Provider>
  );
}

export function useSourceContext() {
  const context = useContext(SourceContext);
  if (context === undefined) {
    throw new Error('Context must be used within a Provider');
  }
  return context; //sourceId
}

SourceContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
