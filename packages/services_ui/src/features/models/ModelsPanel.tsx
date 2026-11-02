import ModelsGrid from './ModelsGrid';
import type { ModelInformation } from './types';
import ModelCard from './ModelCard';
import { Stack, Text } from '@mantine/core';

export interface ModelsPanelProps {
  models: Array<ModelInformation>;
}

export const ModelsPanel = ({ models }: ModelsPanelProps) => {
  return (
    <Stack classNames={{ root: 'w-full h-full p-2 bg-base-lighter' }}>
      <Stack>
        <Text fw="bold" size="lg" className="ml-2 uppercase tracking-wide">
          Model Repository
        </Text>
        <p>Here you can see all the models available to you.</p>
      </Stack>
      <ModelsGrid>
        {models.map((m) => (
          <ModelCard {...m} key={m.guid} />
        ))}
      </ModelsGrid>
    </Stack>
  );
};

export default ModelsPanel;
