import React from "react";
import  EmbeddingsPanel from "./EmbeddingsPanel";
import { useGetAvailableEmbeddingsQuery} from '../../core/embeddingsApi'

const EmbeddingsCatalog = () => {

    const { data, isFetching, isError  } = useGetAvailableEmbeddingsQuery('expr');

    console.log("EmbeddingsCatalog", data)
    return <EmbeddingsPanel />
};

export default EmbeddingsCatalog;
