import React, { useState, useEffect } from 'react';
import { MantineProvider, Button, Group, createTheme } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import ContinuousCovariates from '../../Components/Covariates/ContinuousCovariates';
import CustomDichotomousCovariates from '../../Components/Covariates/CustomDichotomousCovariates';
//import CovariatesCardsList from '../../Components/Covariates/CovariatesCardsList';
import ACTIONS from '../../Utils/StateManagement/Actions';
import initialState from '../../Utils/StateManagement/InitialState';
import { State, Action } from '../../Utils/StateManagement/reducer';

export const SelectCovariatesBtnTheme = createTheme({
  components: {
    Button: Button.extend({
      defaultProps: {
        leftSection: <IconPlus stroke={2} className="text-vadc-alternate_row bg-gen3-highlight_orange rounded group-hover:bg-white group-hover:text-vadc-primary" />,
        classNames: {
          root: 'group bg-vadc-alternate_row border-vadc-primary text-vadc-primary hover:text-white hover:bg-vadc-primary ',
        },
        variant: 'outline',
        size: 'xl',
        radius: 'md',
      },
    }),
  },
});

interface SelectCovariatesInput {
  readonly dispatch: (arg: Action) => void,
  readonly studyPopulationCohort: State['selectedStudyPopulationCohort'],
  readonly outcome: State['outcome'],
  readonly covariates: State['covariates'],
  readonly selectedTeamProject: State['selectedTeamProject'],
}

const SelectCovariates = ({
  dispatch,
  studyPopulationCohort,
  outcome,
  covariates,
  selectedTeamProject,
}: SelectCovariatesInput) => {
  const [selectionMode, setSelectionMode] = useState('');
  useEffect(() => {
    dispatch({
      type: ACTIONS.SET_SELECTION_MODE,
      payload: '',
    });
    dispatch({
      type: ACTIONS.UPDATE_SELECTED_HARE,
      payload: initialState.selectedHare,
    });
  }, []);

  return (
    <div className="GWASUI-row">
      <div data-tour="select-covariate" className="GWASUI-double-column">
        {selectionMode === 'continuous' && (
          <div className="select-container">
            <ContinuousCovariates
              dispatch={dispatch}
              selectedStudyPopulationCohort={studyPopulationCohort}
              selectedCovariates={covariates}
              outcome={outcome}
              handleClose={() => {
                setSelectionMode('');
                dispatch({
                  type: ACTIONS.SET_SELECTION_MODE,
                  payload: '',
                });
              }}
              handleSelect={(chosenCovariate) => {
                dispatch({
                  type: ACTIONS.ADD_COVARIATE,
                  payload: chosenCovariate,
                });
              }}
              submitButtonLabel={'Add'}
            />
          </div>
        )}

        {selectionMode === 'dichotomous' && (
          <div className="select-container">
            <CustomDichotomousCovariates
              dispatch={dispatch}
              studyPopulationCohort={studyPopulationCohort}
              covariates={covariates}
              outcome={outcome}
              handleClose={() => {
                setSelectionMode('');
                dispatch({
                  type: ACTIONS.SET_SELECTION_MODE,
                  payload: '',
                });
              }}
              handleSelect={(chosenCovariate) => {
                dispatch({
                  type: ACTIONS.ADD_COVARIATE,
                  payload: chosenCovariate,
                });
              }}
              submitButtonLabel={'Add'}
              selectedTeamProject={selectedTeamProject}
            />
          </div>
        )}
        {!selectionMode && (
          <MantineProvider theme={SelectCovariatesBtnTheme}>
            <Group justify="center">
              <Button
                data-tour="select-covariate-continious"
                onClick={() => {
                  setSelectionMode('continuous');
                  dispatch({
                    type: ACTIONS.SET_SELECTION_MODE,
                    payload: 'continuous',
                  });
              }}>
                Add Continuous Covariate
              </Button>

              <Button
                data-tour="select-covariate-dichotomous"
                onClick={() => {
                  setSelectionMode('dichotomous');
                  dispatch({
                    type: ACTIONS.SET_SELECTION_MODE,
                    payload: 'dichotomous',
                  });
                }}>
                Add Dichotomous Covariate
              </Button>
            </Group>
          </MantineProvider>
        )}
      </div>

      <div
        data-tour="covariates-card"
        className="GWASUI-column GWASUI-card-column"
      >
        CovariatesCardsList placeholder
        {/*<CovariatesCardsList
          covariates={covariates}
          outcome={outcome}
          deleteCovariate={(chosenCovariate) => dispatch({
            type: ACTIONS.DELETE_COVARIATE,
            payload: chosenCovariate,
          })}
        />*/}
      </div>
    </div>
  );
};

export default SelectCovariates;
