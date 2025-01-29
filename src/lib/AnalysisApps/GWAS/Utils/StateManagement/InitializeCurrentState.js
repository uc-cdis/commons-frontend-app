import initialState from './InitialState';

const InitializeCurrentState = () => ({
  ...initialState,
  // selectedTeamProject: localStorage.getItem('teamProject'),
  selectedTeamProject: '',
});

export default InitializeCurrentState;
