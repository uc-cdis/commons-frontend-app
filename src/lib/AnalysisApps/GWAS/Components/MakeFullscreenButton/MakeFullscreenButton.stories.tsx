import React from 'react';
import MakeFullscreenButton from './MakeFullscreenButton';
import FullscreenSelectors from './FullscreenSelectors';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';

const meta: Meta<typeof MakeFullscreenButton> = {
  title: 'GWASAPP/MakeFullscreenButton ',
  component: MakeFullscreenButton,
};

export default meta;
type Story = StoryObj<typeof MakeFullscreenButton>;

const MakeFullscreenButtonWithElementsToHide = () => {
  const totalCombinationsRGB = 16777215;
  const randomBorder = () => {
    return {
      border: '3px solid',
      borderColor:
        '#' + Math.floor(Math.random() * totalCombinationsRGB).toString(16),
    };
  };
  return (
    <React.Fragment>
      <div>
        {FullscreenSelectors.map((selectorString, iterator) => (
          <React.Fragment key={iterator}>
            {iterator === 0 && (
              <h3 className={selectorString.replace('.', '')}>
                Selectors to be Hidden and Shown to Make Full Screen:
              </h3>
            )}
            <hr />
            {selectorString === 'header' && (
              <header style={randomBorder()}>Header Element</header>
            )}
            {selectorString === 'footer' && (
              <footer style={randomBorder()}>Footer Element</footer>
            )}
            {selectorString !== 'footer' && selectorString !== 'header' && (
              <div
                className={selectorString.replace('.', '')}
                style={randomBorder()}
              >
                {selectorString}
              </div>
            )}
          </React.Fragment>
        ))}
        <br />
      </div>
      <MakeFullscreenButton />
    </React.Fragment>
  );
};

export const MockedSuccess: Story = {
  render: () => <MakeFullscreenButtonWithElementsToHide />,
};

export const InteractionTest: Story = {
  render: () => <MakeFullscreenButtonWithElementsToHide />,
  /* Interaction Tests */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByTestId('make-full-screen-button'),
    ).toBeInTheDocument();

    await expect(canvas.getByText('Header Element')).toBeInTheDocument();
    await expect(canvas.getByText('Footer Element')).toBeInTheDocument();
    await expect(canvas.getByText('Make Fullscreen')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button'));

    await expect(canvas.getByText('Header Element')).not.toBeVisible();
    await expect(canvas.getByText('Footer Element')).not.toBeVisible();
    await expect(canvas.getByText('Exit Fullscreen')).toBeInTheDocument();
  },
};
