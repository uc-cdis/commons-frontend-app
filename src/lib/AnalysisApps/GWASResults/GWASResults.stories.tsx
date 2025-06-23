import React from 'react';
import GWASResultsContainer from './GWASResultsContainer';

import { Meta, StoryObj } from '@storybook/react';


const meta: Meta<typeof GWASResultsContainer> = {
  title: 'Results',
  component: GWASResultsContainer,
};

export default meta;
type Story = StoryObj<typeof GWASResultsContainer>;


export const Mock: Story = {
  render: () => <GWASResultsContainer />,
};
