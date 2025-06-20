import React from 'react';
import { PLPAppSteps } from '../../Utils/constants';
import TourButton from './TourButton/TourButton';

interface ProgressBarProps {
  currentStep: number;
  selectionMode: string;
}

const ProgressBar = ({ currentStep, selectionMode }: ProgressBarProps) => (
  <div data-testid="progress-bar" className="flex  mb-5">
    <div className="flex justify-left">
      {PLPAppSteps.map((item, index) => (
        <div
          key={index}
          data-testid="progress-bar-step"
          className={`transition-colors duration-300 mr-5 pr-5 border-b-4 font-medium border-b-accent-cool-contrast-max ${
            currentStep === index
              ? 'border-b-vadc-gold text-vadc-gold'
              : 'border-b-accent-cool-contrast-max'
          }`}
        >
          <span className="text-2xl pr-2 ">{index + 1}</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
    <div className="ml-auto">
      <TourButton currentStep={currentStep} selectionMode={selectionMode} />
    </div>
  </div>
);

export default ProgressBar;
