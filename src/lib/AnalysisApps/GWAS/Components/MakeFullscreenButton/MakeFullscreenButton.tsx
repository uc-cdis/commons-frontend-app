import React, { useState, useEffect } from 'react';
import FullscreenSelectors from './FullscreenSelectors';
import { Button } from '@mantine/core';
import { IconArrowsMaximize, IconArrowLeft } from '@tabler/icons-react';

type DisplayValue = 'none' | 'block';

const MakeFullscreenButton = () => {
  const [analysisIsFullscreen, setAnalysisIsFullscreen] = useState(false);

  const setElementsDisplay = (selector: string, displayValue: DisplayValue) => {
    document.querySelectorAll(selector).forEach((element) => {
      const temporaryElement = element as HTMLElement;
      temporaryElement.style.display = displayValue;
    });
  };

  const HideShowElementsForFullscreen = (displayValue: DisplayValue) => {
    FullscreenSelectors.forEach((selector) => {
      setElementsDisplay(selector, displayValue);
    });
  };

  const handleFullscreenButtonClick = () => {
    if (!analysisIsFullscreen) {
      HideShowElementsForFullscreen('none');
    }
    if (analysisIsFullscreen) {
      HideShowElementsForFullscreen('block');
    }
    setAnalysisIsFullscreen(!analysisIsFullscreen);
  };

  // Reset any hidden elements when leaving the app
  useEffect(() => () => HideShowElementsForFullscreen('block'), []);
  return (
    <div
      data-testid="make-full-screen-button"
      className="flex justify-center pt-8"
    >
      <Button
        onClick={handleFullscreenButtonClick}
        rightSection={
          analysisIsFullscreen ? (
            <IconArrowLeft size={16} />
          ) : (
            <IconArrowsMaximize size={16} />
          )
        }
      >
        {analysisIsFullscreen ? 'Exit Fullscreen' : 'Make Fullscreen'}
      </Button>
    </div>
  );
};

export default MakeFullscreenButton;
