interface IhomeTableState {
  useLocalStorage: boolean;
  columnManagement: object;
}
const UpdateColumnManagement = (homeTableState: IhomeTableState) => {
  if (homeTableState.useLocalStorage) {
    localStorage.setItem(
      'columnManagement',
      JSON.stringify(homeTableState.columnManagement),
    );
  }
};

export default UpdateColumnManagement;
