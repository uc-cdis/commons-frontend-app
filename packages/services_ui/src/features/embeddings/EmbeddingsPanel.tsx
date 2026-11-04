import React from "react";
import { Stack, Text } from "@mantine/core";
import ModelsGrid from "../models/ModelsGrid";
import EmbeddingCard from "./EmbeddingCard";
import type { EmbeddingInfo } from "./types";

export interface EmbeddingsPanelProps {
  embeddings: EmbeddingInfo[];
}

const EmbeddingsPanel = ({ embeddings }: EmbeddingsPanelProps) => {
  return (
    <Stack classNames={{ root: "w-full h-full p-2 bg-base-lighter" }}>
      <Stack>
        <Text fw="bold" size="lg" className="ml-2 uppercase tracking-wide">
          Embedding Collections
        </Text>
        <p>Here you can see all the embedding collections available to you.</p>
      </Stack>
      {embeddings.length === 0 ? (
        <Text c="dimmed">No embedding collections found.</Text>
      ) : (
        <ModelsGrid>
          {embeddings.map((e) => (
            <EmbeddingCard {...e} key={e.id} />
          ))}
        </ModelsGrid>
      )}
    </Stack>
  );
};

export default EmbeddingsPanel;
