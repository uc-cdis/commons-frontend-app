import { useState, useEffect } from 'react';
import { getPage, GetPageOpts} from '@/features/MystMd/loader';

interface UseGetProjectResult {
  data: Awaited<ReturnType<typeof getPage>> | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

/**
 * A custom hook used to fetch project-related data.
 *
 * @param {GetPageOpts} opts - Options provided to fetch the project data, including content URL, project identifier, slug, and other parameters.
 * @returns {UseGetProjectResult} An object containing the fetched project data, loading status, error state, error details, and success status.
 *
 * @typedef {Object} GetPageOpts
 * @property {string} contentURL - The URL to fetch content from.
 * @property {string} project - The identifier of the project to fetch.
 * @property {string} slug - The slug used to locate the specific project data.
 * @property {boolean} loadIndexPage - Flag indicating whether the index page should be loaded.
 * @property {boolean} redirect - Flag indicating whether redirects should be followed.
 *
 * @typedef {Object} UseGetProjectResult
 * @property {Awaited<ReturnType<typeof getPage>> | null} data - The fetched project data or null if not available.
 * @property {boolean} isLoading - Indicates whether the data is currently being loaded.
 * @property {boolean} isError - Indicates whether there was an error during data fetching.
 * @property {Error | null} error - The error occurred during fetching, or null if no error occurred.
 * @property {boolean} isSuccess - Indicates whether data fetching was successful.
 */
export const useGetProject = (opts: GetPageOpts): UseGetProjectResult => {
  const [data, setData] = useState<Awaited<ReturnType<typeof getPage>> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        const result = await getPage(opts);

        // Check if result is an error
        if ('status' in result && result.status === 404) {
          throw new Error(result.statusText);
        }

        setData(result);
        setIsSuccess(true);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [opts.contentURL, opts.project, opts.slug, opts.loadIndexPage, opts.redirect]);

  return { data, isLoading, isError, error, isSuccess };
};
