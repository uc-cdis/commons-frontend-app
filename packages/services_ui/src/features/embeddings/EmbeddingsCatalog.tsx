import React, { useMemo } from "react";
import { LoadingOverlay, Text } from "@mantine/core";
import EmbeddingsPanel from "./EmbeddingsPanel";
import { useGetEmbeddingsQuery } from "../../core/embeddingsApi";
import { convertEmbeddingCollection } from "./convert";
import type { EmbeddingCollectionsResponse } from "./types";

const EmbeddingsCatalog = () => {
  const { data, isFetching, isError } = useGetEmbeddingsQuery();

  const embeddings = useMemo(
    () => ((data as EmbeddingCollectionsResponse | undefined)?.collections ?? []).map(convertEmbeddingCollection),
    [data],
  );

  if (isError) return <Text c="red">Unable to load the embedding collections.</Text>;

  return (
    <div className="relative w-full h-full">
      <LoadingOverlay visible={isFetching} />
      <EmbeddingsPanel embeddings={embeddings} />
    </div>
  );
};

export default EmbeddingsCatalog;
