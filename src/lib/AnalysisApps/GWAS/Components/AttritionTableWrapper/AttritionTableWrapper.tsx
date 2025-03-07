import React, { useState } from 'react';
// import AttritionTable from './AttritionTable/AttritionTable';
// import AttritionTableModal from './AttritionTableModal/AttritionTableModal';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import isEnterOrSpace from '@/lib/AnalysisApps/SharedUtils/AccessibilityUtils/IsEnterOrSpace';

interface AttritionTableWrapperProps {
  selectedCohort: { [key: string]: any } | null;
  outcome: { [key: string]: any } | null;
  covariates: Array<{ [key: string]: any }>;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const AttritionTableWrapper: React.FC<AttritionTableWrapperProps> = ({
  covariates,
  selectedCohort,
  outcome,
}) => {
  /* const useSecondTable = outcome?.variable_type === 'custom_dichotomous';

  const [modalInfo, setModalInfo] = useState({
    title: '',
    isModalOpen: false,
    selectedCohort: null,
    currentCovariateAndCovariatesFromPrecedingRows: null,
    outcome: null,
    rowObject: null,
  });
  */
  /*
  // Keep modal info up-to-date with changes in the data needed for data viz
  useEffect(() => {
    setModalInfo({
      ...modalInfo,
      selectedCohort,
      outcome,
    });
  }, [selectedCohort, covariates, outcome]);
  */

  const [isOpen, setIsOpen] = useState(false);
  const toggleArrow = () => setIsOpen((prev) => !prev);

  return (
    <div data-tour="attrition-table">
      <div
        className="bg-vadc-tertiary my-5 text-sm cursor-pointer hover:bg-vadc-tertiary select-none"
        role="button"
        tabIndex={0}
        onClick={toggleArrow}
        onKeyDown={(e) => (isEnterOrSpace(e) ? toggleArrow() : null)}
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
          {isOpen ? <div className="pl-4 py-10">Table content</div> : null}
        </div>{' '}
      </div>

      {/*  <AttritionTableModal modalInfo={modalInfo} setModalInfo={setModalInfo} />
      <AttritionTable
        covariates={covariates}
        selectedCohort={selectedCohort}
        outcome={outcome}
        tableType={useSecondTable ? 'Case Cohort' : ''}
        modalInfo={modalInfo}
        setModalInfo={setModalInfo}
      />
      {useSecondTable && (
        <AttritionTable
          covariates={covariates}
          selectedCohort={selectedCohort}
          outcome={outcome}
          tableType={'Control Cohort'}
          modalInfo={modalInfo}
          setModalInfo={setModalInfo}
        />
      )} */}
    </div>
  );
};

export default AttritionTableWrapper;
