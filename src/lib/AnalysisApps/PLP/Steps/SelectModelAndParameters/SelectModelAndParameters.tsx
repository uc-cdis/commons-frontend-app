import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import { LassoParameters } from './LassoParameters';
import { RandomForestParameters } from './RandomForestParameters';
import { SupportVectorMachineParameters } from './SupportVectorMachineParameters';
import { useState } from 'react';
import { Tabs, TabsList, TabsTab, TabsPanel } from '@mantine/core';
import { Flex, Box, Title } from '@mantine/core';

const modelOptions = [
  'Lasso Logistic Regression',
  'Random Forest',
  'Support Vector Machine',
  'Ada Boost',
  'Decision Tree',
  'Naïve Bayes',
  'Multilayer Perception Model',
  'Nearest Neighbors',
];

type SelectModelAndParametersProps = {
  dispatch: (action: any) => void;
  model: string;
  modelParameters: Record<string, any>;
};

const SelectModelAndParameters = ({
  model = modelOptions[0],
  modelParameters,
  dispatch,
}: SelectModelAndParametersProps) => {
  const handleSetModel = (model: string) => {
    setActiveTab(model)
    dispatch({
      type: ACTIONS.SET_SELECTED_MODEL,
      payload: model,
    });
  };

  const getModelParameters = (model: string) => {
    switch (model) {
      case 'Lasso Logistic Regression':
        return <LassoParameters
          dispatch={dispatch}
          model={model}
          modelParameters={modelParameters}
        />;
      case 'Random Forest':
         return <RandomForestParameters
          dispatch={dispatch}
          model={model}
          modelParameters={modelParameters}
         />;
      case 'Support Vector Machine':
         return <SupportVectorMachineParameters
          dispatch={dispatch}
          model={model}
          modelParameters={modelParameters}
         />;
      // add other cases...
      default:
        return "Not Available";
    }
  }

  const [activeTab, setActiveTab] = useState<string>(model);
  return (
    <Box>
      <Title order={4} mb="sm">
        Select a Model
      </Title>
      <Tabs
        value={activeTab}
        onChange={(e) => {handleSetModel(e ? e :'')}}
        orientation="vertical"
        variant="outline"
      >
        <Flex align="flex-start">
          <TabsList
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: 250,
              flexShrink: 0,
            }}
          >
            {modelOptions.map((model) => (
              <TabsTab key={model} value={model.replace(/\s+/g, '-')}>
                {model}
              </TabsTab>
            ))}
          </TabsList>

          <Box ml="md" style={{ flex: 1 }}>
            {modelOptions.map((model) => (
              <TabsPanel key={model} value={model.replace(/\s+/g, '-')}>
                <Title order={5} mb="sm">
                  Selected model: {model}
                </Title>
                { getModelParameters(model) }
              </TabsPanel>
            ))}
          </Box>
        </Flex>
      </Tabs>
    </Box>
  );
};

export default SelectModelAndParameters;
