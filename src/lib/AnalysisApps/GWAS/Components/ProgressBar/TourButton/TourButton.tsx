import React from 'react';
// import { useTour } from '@reactour/tour';
// import TourSteps from './TourSteps';
import { Button } from '@mantine/core';

interface TourButtonProps {
  currentStep: number;
  selectionMode: string;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const TourButton: React.FC<TourButtonProps> = ({
  currentStep,
  selectionMode,
}) => {
  // const { setIsOpen, setSteps } = useTour();

  /*   useEffect(() => {
    if (selectionMode === 'continuous' && currentStep === 1) {
      setSteps(TourSteps[1.1]);
    } else if (selectionMode === 'dichotomous' && currentStep === 1) {
      setSteps(TourSteps[1.2]);
    } else if (selectionMode === 'continuous' && currentStep === 2) {
      setSteps(TourSteps[2.1]);
    } else if (selectionMode === 'dichotomous' && currentStep === 2) {
      setSteps(TourSteps[2.2]);
    } else {
      setSteps(TourSteps[currentStep]);
    }
  }, [currentStep, selectionMode]); */

  return (
    /*     <Button onClick={() => setIsOpen(true)}>
      New to GWAS? Get started here!
    </Button> */
    <Button variant="default" onClick={() => alert('Coming soon.')}>
      New to GWAS? Get started here!
    </Button>
  );
};

export default TourButton;
