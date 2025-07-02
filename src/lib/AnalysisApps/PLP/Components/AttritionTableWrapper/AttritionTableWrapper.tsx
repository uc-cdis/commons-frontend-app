import React, { useState } from 'react';
import { AttritionTable } from './AttritionTable/AttritionTable';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

interface AttritionTableWrapperProps {
  dispatch: (action: any) => void;
  selectedStudyPopulationCohort: cohort;
  datasetObservationWindow: number;
  selectedOutcomeCohort: cohort;
  outcomeObservationWindow: number;
  percentageOfDataToUseAsTest: number | null;
}

interface cohort { // TODO - centralize this interface
  cohort_definition_id: number;
  cohort_name: string;
  size: number;
}

const AttritionTableWrapper: React.FC<AttritionTableWrapperProps> = ({
  dispatch,
  selectedStudyPopulationCohort,
  datasetObservationWindow,
  selectedOutcomeCohort,
  outcomeObservationWindow,
  percentageOfDataToUseAsTest,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleArrow = () => setIsOpen((prev) => !prev);

  return (
    <div data-tour="attrition-table">
      <button
        className="bg-vadc-tertiary my-5 text-sm cursor-pointer hover:bg-vadc-tertiary select-none w-full text-left appearance-none border-none p-0"
        onClick={toggleArrow}
      >
        <div className="p-3 flex">
          <span className="flex justify-center h-4 mr-3 text-white w-4 bg-vadc-secondary rounded-full ">
            {isOpen ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </span>
          <span> Attrition Table</span>
        </div>
        <div
          className={`bg-vadc-slate_blue pl-4 overflow-hidden transition-all duration-1000 ease-in-out ${
            isOpen ? 'max-h-screen' : 'max-h-0'
          }`}
        >
          {isOpen ? <div className="pl-4 py-10">
            <AttritionTable
              dispatch={dispatch}
              selectedStudyPopulationCohort={selectedStudyPopulationCohort}
              datasetObservationWindow={datasetObservationWindow}
              selectedOutcomeCohort={selectedOutcomeCohort}
              outcomeObservationWindow={outcomeObservationWindow}
              percentageOfDataToUseAsTest={percentageOfDataToUseAsTest}
              />
          </div> : null}
        </div>{' '}
      </button>

    </div>
  );
};

export default AttritionTableWrapper;
