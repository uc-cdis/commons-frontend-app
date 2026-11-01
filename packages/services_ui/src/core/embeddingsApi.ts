import { gen3Api} from '@gen3/core';
import {GEN3_EMBEDDINGS_SERVICE} from "./constants";

interface Embedding {
  id: string;
  embedding: number[];
}



export const embeddingsApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableEmbeddings: builder.query<any, string>({
      query: (collection) => ({
        url: `${GEN3_EMBEDDINGS_SERVICE}/${collection}`,
      }),
    }),
    getEmbeddings: builder.query<any, void>({
      query: () => ({
        url: `${GEN3_EMBEDDINGS_SERVICE}`,
      }),
    }),
  }),
});


export const { useGetAvailableEmbeddingsQuery, useGetEmbeddingsQuery } = embeddingsApi;
