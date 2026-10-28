import {
  useGetDownloadQuery,
  useGetIndexdMetdataQuery,
  useGetIndexObjectQuery,
} from '@gen3/core';

export const useGetBAMAndBAIFileFromGUID = (bamId: string) => {
  const skip = !bamId;

  // currentData (not data) is undefined while args change, so results from a
  // previous bamId are never used.
  const bam = useGetIndexObjectQuery(bamId, { skip });
  const bamUrl = useGetDownloadQuery(bamId, { skip });

  const baiFilename = bam.currentData?.file_name?.replace(/\.bam$/, '.bai');
  const bai = useGetIndexdMetdataQuery(
    { filters: [{ key: 'file_name', value: baiFilename ?? '' }] },
    { skip: !baiFilename },
  );

  const baiRecord = bai.currentData?.records?.[0];
  const baiId = baiRecord?.baseid;
  const baiUrl = useGetDownloadQuery(baiId ?? '', { skip: !baiId });

  const indexNotFound = bai.isSuccess && !baiId;
  const queries = [bam, bamUrl, bai, baiUrl];

  const isFetching = queries.some((q) => q.isFetching);
  const isError = queries.some((q) => q.isError) || indexNotFound;
  const isSuccess =
    bam.isSuccess && bamUrl.isSuccess && bai.isSuccess && baiUrl.isSuccess;

  return {
    bamMetadata: isSuccess ? bam.currentData : undefined,
    baiMetadata: isSuccess ? baiRecord : undefined,
    bamUrl: isSuccess ? bamUrl.currentData : undefined,
    baiUrl: isSuccess ? baiUrl.currentData : undefined,
    isFetching,
    isError,
    isSuccess,
    errors: {
      bam: bam.error,
      bamUrl: bamUrl.error,
      bai: bai.error,
      baiUrl: baiUrl.error,
      indexNotFound: indexNotFound
        ? `Index file ${baiFilename} not found`
        : undefined,
    },
  };
};
