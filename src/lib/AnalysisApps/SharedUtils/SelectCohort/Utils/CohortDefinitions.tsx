import React, { useState } from 'react';
import { IconDatabaseOff } from '@tabler/icons-react';
import { Loader, Table, Pagination, Select } from '@mantine/core';
import { useFilter } from '../../../PLP/Utils/formHooks';
import { CohortsEndpoint } from '@/lib/AnalysisApps/SharedUtils/Endpoints';
import useSWR from 'swr';
import { useSourceContext } from '../../Source';

interface CohortDefinitionsProps {
  selectedCohort?: cohort | undefined;
  handleCohortSelect: (arg0: cohort) => void;
  searchTerm: string;
  selectedTeamProject: string;
}
interface cohort { // TODO - centralize this interface
  cohort_definition_id: number;
  cohort_name: string;
  size: number;
}

const CohortDefinitions: React.FC<CohortDefinitionsProps> = ({
  selectedCohort = undefined,
  handleCohortSelect,
  searchTerm,
  selectedTeamProject,
}) => {
  const { sourceId } = useSourceContext();
  const [page, setPage] = useState(1); // Track current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Number of rows to show per page
  const { data, error, isLoading } = useSWR(
    CohortsEndpoint + '/' + sourceId + `/by-team-project?team-project=${selectedTeamProject}`,
    (...args) => fetch(...args).then((res) => res.json()),
  );
  let displayedCohorts: cohort[] = useFilter(data?.['cohort_definitions_and_stats'], searchTerm, 'cohort_name');

  if (error)
    return <React.Fragment>Error getting data for table</React.Fragment>;

  if (isLoading)
    return (
      <div className="flex justify-center pt-8 min-h-[300px]">
        <Loader size="lg" />
      </div>
    );

  if (data) {
    displayedCohorts = displayedCohorts.slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage,
    );
    const totalPagesForPagination = Math.ceil(data.length / rowsPerPage);

    return (
      <React.Fragment>
        <div className="w-full min-h-[200px] py-5">
          {displayedCohorts?.length > 0 ? (
            <Table className="shadow">
              <Table.Thead className="bg-vadc-slate_blue font-light">
                <Table.Tr>
                  <Table.Th>Select</Table.Th>
                  <Table.Th>Cohort Name</Table.Th>
                  <Table.Th>Size</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {displayedCohorts.map((cohort, i) => (
                  <Table.Tr
                    key={i}
                    className={i % 2 ? 'bg-vadc-alternate_row' : ''}
                  >
                    <Table.Td>
                      <input
                        type="radio"
                        id={`radio-buttion-${i}`}
                        checked={selectedCohort?.cohort_definition_id === cohort.cohort_definition_id}
                        onChange={() => {
                          handleCohortSelect(cohort);
                        }}
                      />
                      <label htmlFor={`radio-buttion-${i}`} className="sr-only">
                        Select this row
                      </label>
                    </Table.Td>
                    <Table.Td>{cohort.cohort_name}</Table.Td>
                    <Table.Td>{cohort.size}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div>
                <IconDatabaseOff />
              </div>
              <div>No Data</div>
            </div>
          )}
          <div
            data-testid="pagination-controls"
            className="flex justify-between w-full"
          >
            <Pagination
              className="pt-5 flex justify-end"
              value={page}
              onChange={setPage}
              total={totalPagesForPagination}
              color="blue"
              size="md"
              withEdges
            />
            <Select
              className="pt-5 pl-3 w-32"
              value={rowsPerPage.toString()}
              onChange={(value) => setRowsPerPage(Number(value))}
              size="sm"
              aria-label="pagination select"
              data={[
                { value: '10', label: '10 /page' },
                { value: '20', label: '20 /page' },
                { value: '50', label: '50 /page' },
                { value: '100', label: '100 /page' },
              ]}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
};

export default CohortDefinitions;
