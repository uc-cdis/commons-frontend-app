export interface EmbeddingInfo {
	id: number;
	collectionName: string;
	description: string;
	dimensions: number;
	vectorType: string;
	/** ISO 8601 timestamp */
	createdAt: string;
	/** ISO 8601 timestamp */
	updatedAt: string;
	/** path of the collection in the vector store API */
	self: string;
}

/** One collection as returned by the vector store API. */
export interface EmbeddingCollectionResponse {
	id: number;
	collection_name: string;
	description: string;
	dimensions: number;
	vector_type: string;
	created_at: string;
	updated_at: string;
	self: string;
}

export interface EmbeddingCollectionsResponse {
	collections: EmbeddingCollectionResponse[];
	page: number;
	page_size: number;
}
