import React, { useState } from 'react';
import AddCohortButton from './Utils/AddCohortButton';
import CohortDefinitions from './Utils/CohortDefinitions';
import SearchBar from '../SearchBar/SearchBar';

interface SelectCohortProps {
  selectedCohort?: number | undefined;
  handleCohortSelect: (selectedRow: number) => void;
  selectedTeamProject: string;
}

/** Component for selecting a cohort, used in select study population view */
const SelectCohort: React.FC<SelectCohortProps> = ({
  selectedCohort,
  handleCohortSelect,
  selectedTeamProject,
}) => {
  const [cohortSearchTerm, setCohortSearchTerm] = useState('');

  const handleCohortSearch = (searchTerm: string) => {
    setCohortSearchTerm(searchTerm);
  };
  return (
    <React.Fragment>
      <div data-tour="cohort-search" className="flex justify-between w-full">
        <SearchBar
          searchTerm={cohortSearchTerm}
          handleSearch={handleCohortSearch}
          field={'cohort name'}
        />

        <AddCohortButton />
      </div>
      <div data-testid="GWASUI-mainTable">
        <div data-tour="cohort-table">
          <div data-tour="cohort-table-body">
            <CohortDefinitions
              selectedCohort={selectedCohort}
              handleCohortSelect={handleCohortSelect}
              searchTerm={cohortSearchTerm}
              selectedTeamProject={selectedTeamProject}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SelectCohort;
