import React from 'react';
import DismissibleMessage from './DismissibleMessage';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DismissibleMessage> = {
  title: 'PLP/DismissibleMessage',
  component: DismissibleMessage,
};

export default meta;
type Story = StoryObj<typeof DismissibleMessage>;

const DismissibleMessageRender = () => {

  return (
    <div>
    <DismissibleMessage
      title = 'Some Title'
      description = 'Some Description'
      messageType = 'success'
    />
    <DismissibleMessage
      title = 'Some Title'
      description = 'Some Description'
      messageType = 'warning'
    />
    <DismissibleMessage
      title = 'Some Title'
      description = 'Some Description'
      messageType = 'caution'
    />
    </div>
  );
};

export const AttritionTableMockedSuccess: Story = {
  render: () => <DismissibleMessageRender />, // see https://storybook.js.org/docs/writing-stories
};
