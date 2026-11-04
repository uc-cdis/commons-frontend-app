import type { EmbeddingCollectionResponse, EmbeddingInfo } from "./types";

export const convertEmbeddingCollection = ({
  collection_name,
  vector_type,
  created_at,
  updated_at,
  ...rest
}: EmbeddingCollectionResponse): EmbeddingInfo => ({
  ...rest,
  collectionName: collection_name,
  vectorType: vector_type,
  createdAt: created_at,
  updatedAt: updated_at,
});
