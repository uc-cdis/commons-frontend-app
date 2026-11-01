import React from 'react';
import { ModelsPanel } from './ModelsPanel';
import sampleModels from './data/models.json';

const ModelsCatalog = () => {
  return (
    <ModelsPanel models={sampleModels} />
  );
};

export default ModelsCatalog;
