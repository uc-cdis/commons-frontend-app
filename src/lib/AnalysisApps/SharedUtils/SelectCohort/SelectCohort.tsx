import React, { useState } from 'react';
import AddCohortButton from './Utils/AddCohortButton';
import CohortDefinitions from './Utils/CohortDefinitions';
import SearchBar from '../../PLP/Components/SearchBar/SearchBar';

interface SelectCohortProps {
  selectedCohort?: cohort | undefined;
  handleCohortSelect: (selectedCohort: cohort) => void;
  selectedTeamProject: string;
}
interface cohort { // TODO - centralize this interface
  cohort_definition_id: number;
  cohort_name: string;
  size: number;
}

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
