import React from "react";
import  EmbeddingsPanel from "./EmbeddingsPanel";
import { useGetEmbeddingsQuery} from '../../core/embeddingsApi'

const EmbeddingsCatalog = () => {

    const { data, isFetching, isError  } = useGetEmbeddingsQuery();

    console.log("EmbeddingsCatalog", data)
    return <EmbeddingsPanel />
};

export default EmbeddingsCatalog;
