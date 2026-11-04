import React, {useMemo} from "react";
import {Button, Progress, Stack, Table, Text} from '@mantine/core';
import { summarizeEmbeddings } from "./summarizeEmbeddings";
import {useMetadata} from "./core/MetadataContext";

import {useProcessing} from "./core/ProcessingContext";
import {ProcessingStep} from "./core/types";


interface ProcessingState {
  name: string;
  description: string;
}

interface ProcessingStates {
  [ProcessingStep.IDLE]: ProcessingState;
  [ProcessingStep.INFERENCE]: ProcessingState;
  [ProcessingStep.MAPPING]: ProcessingState;
  [ProcessingStep.NEIGHBORHOOD]: ProcessingState;
  [ProcessingStep.EXTRACT_ALL]: ProcessingState;
  [ProcessingStep.READY]: ProcessingState;
  [ProcessingStep.UNINITIALIZED]: ProcessingState;
}

const PROCESSING_STATE_DESCRIPTIONS : ProcessingStates = {
  [ProcessingStep.IDLE]: {
    name: 'Idle',
    description: 'No processing is currently running.',
  },
  [ProcessingStep.INFERENCE]: {
    name: 'Inference',
    description: 'Running inference on the uploaded files.',
  },
  [ProcessingStep.MAPPING]: {
    name: 'Mapping',
    description: 'Mapping the embeddings to the original files.',
  },
  [ProcessingStep.NEIGHBORHOOD]: {
    name: 'Nearest',
    description: 'Using embedding to to find closest patients.',
  },
  [ProcessingStep.EXTRACT_ALL]: {
    name: 'Connecting Input',
    description: 'Connecting input to TCGA patients.',
  },
  [ProcessingStep.READY]: {
    name: 'Ready',
    description: 'Processing is complete.',
  },
  [ProcessingStep.UNINITIALIZED]: {
    name: 'No Data',
    description: 'No files have been loaded for processing.',
  }
}


const ProcessAllPanel = () => {

  const { isEmpty } = useMetadata();
  const { isProcessing, isProcessingError, progress, results, processingState, processAll } = useProcessing();
  const step = PROCESSING_STATE_DESCRIPTIONS[processingState];


  return (<div className="flex flex-col space-y-2 m-2 p-1">
    <div className="h-5 w-full m-1 p1">
    {isProcessing && <Progress value={progress} />}
    </div>
    <div>
      <Text fw={500}>{step.name}</Text>
      <Text size="sm" c="dimmed">{step.description}</Text>
    </div>
    <div className="border-1 border-base-light p-2">
    <Button onClick={processAll} loading={isProcessing} disabled={isEmpty} color="accentWarm.4">Map Input Data</Button>
    </div>
    {isProcessingError && <Text c="red">Processing failed. See the console for details.</Text>}
    </div>);
};

export default ProcessAllPanel;
