import React from 'react';
import { ModelsPanel } from './ModelsPanel';
import sampleModels from './data/real_models.json';
import { convertModelRepositoryResponse } from './convert';

const ModelsCatalog = () => {

  const models = [convertModelRepositoryResponse(sampleModels)];

  return (
    <ModelsPanel models={models} />
  );
};

export default ModelsCatalog;
