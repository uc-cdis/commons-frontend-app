import React, { useEffect, useState } from 'react';
import { Table, Loader } from '@mantine/core';
import { CohortsEndpoint, CohortsOverlapEndpoint } from '@/lib/AnalysisApps/SharedUtils/Endpoints';
import { useSourceContext } from '../../../../SharedUtils/Source';
import ACTIONS from '../../../Utils/StateManagement/Actions';

interface AttritionTableProps {
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

type Key = 'A1' | 'B1' | 'C1' | 'D1' | 'A2' | 'B2' | 'C2' | 'D2' | 'A3' | 'B3' | 'C3' | 'D3' | 'A4' | 'B4' | 'C4'| 'D4' ;
type ValueMap = Record<Key, number | null>;
type LoadingMap = Record<Key, boolean>;
const ComputeError = 1;

const cellKeys: Key[][] = [
  ['A1', 'B1', 'C1', 'D1'],
  ['A2', 'B2', 'C2', 'D2'],
  ['A3', 'B3', 'C3', 'D3'],
  ['A4', 'B4', 'C4', 'D4'],
];

export const AttritionTable: React.FC<AttritionTableProps> = ({
  dispatch,
  selectedStudyPopulationCohort,
  datasetObservationWindow,
  selectedOutcomeCohort,
  outcomeObservationWindow,
  percentageOfDataToUseAsTest,
}) => {
  const { sourceId } = useSourceContext();
  const steps = [ 1, 2, 4, 6 ]; // the workflow step related to each description below
  const descriptions = [
    'Initial data cohort',
    `Observation window (${datasetObservationWindow} days)`,
    `Time-at-risk (${outcomeObservationWindow} days)`,
    `Training set (${percentageOfDataToUseAsTest? 100-percentageOfDataToUseAsTest : '...'}%)`,
  ];

  const getTraininSetSize = async (baseSize: number | null) => {
    if (! (percentageOfDataToUseAsTest && baseSize)) {
      return null;
    } else {
      return Math.round(baseSize * (100-percentageOfDataToUseAsTest)/100);
    }
  }

  const getAndSetRemaningSize = async (baseSize: number | null) => {
    if (!baseSize) {
      return null
    } else {
      // update global remaining size state:
      dispatch({
        type: ACTIONS.SET_DATASET_REMAINING_SIZE,
        payload: baseSize,
      });
      return baseSize;
    }
  }

  const getOverlapWithOutcome = async () => {
    if (! (selectedStudyPopulationCohort && selectedOutcomeCohort) ) {
      return null;
    }
    const endpoint = CohortsOverlapEndpoint + `/${sourceId}/by-cohort-definition-ids/${selectedStudyPopulationCohort.cohort_definition_id}/${selectedOutcomeCohort.cohort_definition_id}`;
    const response = await fetch(endpoint, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData.cohort_overlap?.case_control_overlap;
  };

  const getInObservationWindow = async () => {
    if (! (selectedStudyPopulationCohort && datasetObservationWindow) ) {
      return null;
    }
    const endpoint = CohortsEndpoint + `/${sourceId}/by-cohort-definition-id/${selectedStudyPopulationCohort.cohort_definition_id}/by-observation-window/${datasetObservationWindow}`;
    const response = await fetch(endpoint, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData.cohort_definition_and_stats?.size;
  };
  const getInObservationWindowAndOverlapWithOutcome = async () => {
    if (! (selectedStudyPopulationCohort && selectedOutcomeCohort && datasetObservationWindow) ) {
      return null;
    }
    const endpoint = CohortsEndpoint + `/${sourceId}/by-cohort-definition-ids/${selectedStudyPopulationCohort.cohort_definition_id}/${selectedOutcomeCohort.cohort_definition_id}/by-observation-window-1st-cohort/${datasetObservationWindow}`;
    const response = await fetch(endpoint, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData.cohort_definition_and_stats?.size;
  };

  const getInObservationWindowAndOverlapWithOutcomeAndInOutcomeWindow = async () => {
    if (! (selectedStudyPopulationCohort && selectedOutcomeCohort && datasetObservationWindow && outcomeObservationWindow) ) {
      return null;
    }
    const endpoint = CohortsEndpoint + `/${sourceId}/by-cohort-definition-ids/${selectedStudyPopulationCohort.cohort_definition_id}/${selectedOutcomeCohort.cohort_definition_id}/by-observation-window-1st-cohort/${datasetObservationWindow}/by-outcome-window-2nd-cohort/${outcomeObservationWindow}`;
    const response = await fetch(endpoint, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData.cohort_definition_and_stats?.size;
  };

  const [values, setValues] = useState<ValueMap>({
    A1: null, B1: null, C1: null, D1: null,
    A2: null, B2: null, C2: null, D2: null,
    A3: null, B3: null, C3: null, D3: null,
    A4: null, B4: null, C4: null, D4: null,
  });

  const [errors] = useState<ValueMap>({
    A1: null, B1: null, C1: null, D1: null,
    A2: null, B2: null, C2: null, D2: null,
    A3: null, B3: null, C3: null, D3: null,
    A4: null, B4: null, C4: null, D4: null,
  });

  const [loading, setLoading] = useState<LoadingMap>({
    A1: false, B1: false, C1: false, D1: false,
    A2: false, B2: false, C2: false, D2: false,
    A3: false, B3: false, C3: false, D3: false,
    A4: false, B4: false, C4: false, D4: false,
  });

  const valueFns: ((vals: ValueMap) => Promise<number | null>)[][] = [
    [
      async () => selectedStudyPopulationCohort?.size,                    // A1
      async (v) => null,                                                  // B1
      async () => getOverlapWithOutcome(),                                // C1
      async (v) => (v.A1 == null || v.C1 == null ? null : (v.A1 - v.C1)), // D1
    ],
    [
      async () => getInObservationWindow(),                               // A2
      async (v) => null,                                                  // B2
      async () => getInObservationWindowAndOverlapWithOutcome(),          // C2
      async (v) => (v.A2 == null || v.C2 == null ? null : (v.A2 - v.C2)), // D2
    ],
    [
      async (v) =>  (v.C3 == null || v.D3 == null ? null : (v.C3 + v.D3)),                         // A3
      async () => null,                                                                            // B3
      async () => getInObservationWindowAndOverlapWithOutcomeAndInOutcomeWindow(),                 // C3
      async (v) =>  (v.D2 == null || v.C2 == null || v.C3 == null ? null : (v.D2 +(v.C2 - v.C3))), // D3
    ],
    [
      async (v) => getAndSetRemaningSize(v.A3),                          // A4
      async (v) => getTraininSetSize(v.A3),                              // B4
      async (v) => getTraininSetSize(v.C3),                              // C4
      async (v) => getTraininSetSize(v.D3),                              // D4
    ],
  ];

  useEffect(() => {
    const compute = async (initialValues: ValueMap, recalculateAll: boolean) => {
      const result: ValueMap = { ...initialValues };
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const key = cellKeys[row][col];
          const fn = valueFns[row][col];
          // only compute if (still) null:
          try {
            if (result[key] == null || recalculateAll) {
              setLoading((prev) => ({ ...prev, [key]: true }));
              result[key] = await fn(result);
              setLoading((prev) => ({ ...prev, [key]: false }));
            }
          } catch (e) {
            console.log(`Error while computing attrition table cell value: ${e}`);
            errors[key] = ComputeError;
            setLoading((prev) => ({ ...prev, [key]: false }));
          }
        }
      }
      return result;
    };

    (async () => {
        const firstPassValues = await compute(values, true); // First pass
        const secondPassValues = await compute(firstPassValues, false); // Second pass using updated values
        setValues(secondPassValues); // Update state with final result
    })();

  }, [
    selectedStudyPopulationCohort,
    datasetObservationWindow,
    selectedOutcomeCohort,
    outcomeObservationWindow,
    percentageOfDataToUseAsTest,
  ]);

  const getValueForKey = (key: Key) => {
    if (loading[key]) {
      return <Loader size="xs" />;
    } else if (values[key] != null) {
      return values[key];
    } else if (errors[key] === ComputeError) {
      return '❌';
    } else {
      return "...";
    }
  };

  return (
    <Table striped withTableBorder withColumnBorders>
      <thead style={{ textAlign: 'left' }}>
        <tr>
          <th>Step</th>
          <th>Filter Applied</th>
          <th>Dataset</th>
          <th>Training set</th>
          <th>With outcome</th>
          <th>Without outcome</th>
        </tr>
      </thead>
      <tbody>
        {cellKeys.map((row, i) => (
          <tr key={i}>
            <td>{steps[i]}</td>
            <td>{descriptions[i]}</td>
            {row.map((key) => (
              <td key={key}>{getValueForKey(key)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
