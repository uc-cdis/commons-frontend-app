import React from "react";
import  EmbeddingsPanel from "./EmbeddingsPanel";
import { useGetEmbeddingsQuery} from '../../core/embeddingsApi'

const EmbeddingsCatalog = () => {

    // oxlint-disable-next-line no-unused-vars
    const { data, isFetching, isError  } = useGetEmbeddingsQuery();
    return <EmbeddingsPanel />
};

export default EmbeddingsCatalog;
