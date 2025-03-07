import { useState, useEffect } from 'react';
import { useGetSourcesQuery } from '@/lib/AnalysisApps/GWAS/Utils/cohortApi';

export const useSourceFetch = () => {
  const [sourceId, setSourceId] = useState<string | undefined>(undefined);
  const { data, error, isError, isSuccess, isFetching } = useGetSourcesQuery();

  useEffect(() => {
    const getSources = () => {
      // fetch sources on initialization

      if (isSuccess) {
        if (Array.isArray(data?.sources) && data.sources.length === 1) {
          setSourceId(data.sources[0].source_id);
        } else {
          const message = `Data source received in an invalid format: ${JSON.stringify(
            data?.sources,
          )}`;
          throw new Error(message);
        }
      }
      if (isError) {
        const message = `Data source received an error: ${error}`;
        throw new Error(message);
      }
    };

    getSources();
  }, [data?.sources, error, isError, isSuccess]);
  return { isFetching, sourceId };
};
