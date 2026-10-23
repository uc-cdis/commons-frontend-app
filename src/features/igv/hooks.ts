import { useEffect } from 'react';
import {
  useLazyGetDownloadQuery,
  useLazyGetIndexdMetdataQuery,
  useLazyGetIndexObjectQuery,
} from '@gen3/core';

export const useGetBAMAndBAIFileFromGUID = (bamId: string) => {
  const [
    fetchBAMData,
    {
      data: bamMetadata,
      error: bamMetadataError,
      isFetching: isFetchingBamMetadata,
      isSuccess: isSuccessBamMetadata,
      isError: isErrorBamMetadata,
    },
  ] = useLazyGetIndexObjectQuery();

  const [
    fetchBAIMetadata,
    {
      data: baiMetadata,
      error: baiMetadataError,
      isFetching: isFetchingBaiMetadata,
      isSuccess: isSuccessBaiMetadata,
      isError: isErrorBaiMetadata,
    },
  ] = useLazyGetIndexdMetdataQuery();

  const [
    fetchBAMDownloadURL,
    {
      data: bamUrl,
      error: downloadBAMURLError,
      isFetching: isFetchingBAMUrl,
      isSuccess: isSuccessBAMUrl,
      isError: isErrorBAMUrl,
    },
  ] = useLazyGetDownloadQuery();

  const [
    fetchBAIDownloadURL,
    {
      data: baiUrl,
      error: downloadBAIURLError,
      isFetching: isFetchingBAIUrl,
      isSuccess: isSuccessBAIUrl,
      isError: isErrorBAIUrl,
    },
  ] = useLazyGetDownloadQuery();

  useEffect(() => {
    if (!bamId) return;

    void fetchBAMData(bamId);
  }, [bamId, fetchBAMData]);

  useEffect(() => {
    if (!isSuccessBamMetadata || !bamMetadata?.file_name) return;

    const baiFilename = bamMetadata.file_name.replace('.bam', '.bai');

    void fetchBAIMetadata({
      filters: [{ key: 'file_name', value: baiFilename }],
    });

    void fetchBAMDownloadURL(bamId);
  }, [
    bamId,
    isSuccessBamMetadata,
    bamMetadata,
    fetchBAIMetadata,
    fetchBAMDownloadURL,
  ]);

  useEffect(() => {
    const baiId = baiMetadata?.records?.[0]?.baseid;
    if (!isSuccessBaiMetadata || !baiId) return;

    void fetchBAIDownloadURL(baiId);
  }, [isSuccessBaiMetadata, baiMetadata, fetchBAIDownloadURL]);

  const isFetching =
    isFetchingBamMetadata ||
    isFetchingBaiMetadata ||
    isFetchingBAMUrl ||
    isFetchingBAIUrl;

  const isError =
    isErrorBamMetadata || isErrorBaiMetadata || isErrorBAMUrl || isErrorBAIUrl;

  const isSuccess =
    isSuccessBamMetadata &&
    isSuccessBaiMetadata &&
    isSuccessBAMUrl &&
    isSuccessBAIUrl;

  return {
    bamMetadata: isSuccess ? bamMetadata : undefined,
    baiMetadata: isSuccess ? baiMetadata?.records?.[0] : undefined,
    bamUrl: isSuccess ? bamUrl : undefined,
    baiUrl: isSuccess ? baiUrl : undefined,
    isFetching,
    isError,
    isSuccess,
    error:
      bamMetadataError ??
      baiMetadataError ??
      downloadBAMURLError ??
      downloadBAIURLError,
  };
};
