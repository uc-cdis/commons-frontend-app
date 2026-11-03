import type { ModelRepositoryResponse, ModelInformation } from "./types";

const SHORT_SHA_LENGTH = 8;

export const convertModelRepositoryResponse = (
  response: ModelRepositoryResponse,
): ModelInformation => {
  const { namespace, description, tags, created_at } = response.metadata;
  return {
    guid: response.id,
    name: `${namespace}`,
    description,
    tags,
    createdAt: created_at,
    // the repository response carries no semantic version, so the revision hash stands in
    version: response.sha.slice(0, SHORT_SHA_LENGTH),
    // the repository response has no license or copyright metadata
    license: "",
    copyright: "2026",
  };
};
