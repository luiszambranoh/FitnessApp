/**
 * Centralized application styles using Tailwind CSS class strings.
 * Organized by component category for maintainability.
 */

export const layout = {
  container: "flex-1 p-5 bg-gray-100 dark:bg-gray-900",
  title: "text-2xl font-bold text-center mb-5 text-gray-900 dark:text-gray-100",
};

export const form = {
  textInput: "border p-3 mb-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600",
  button: "bg-blue-600 p-4 mt-4 rounded-lg items-center",
  buttonText: "text-white font-bold text-base",
  errorText: "text-red-500 mb-2 ml-1",
  setInput: "border border-gray-600 p-2 rounded-lg text-white bg-gray-700 w-1/4 mr-1",
};

export const list = {
  itemContainer: "flex-row items-center p-4 mb-2 bg-white dark:bg-gray-800 rounded-lg",
  itemText: "text-lg ml-4 text-gray-900 dark:text-gray-200",
  itemIcon: "text-gray-900 dark:text-gray-200",
  itemChevron: "text-gray-400 dark:text-gray-500",
  exerciseCountingType: "text-sm text-gray-600 dark:text-gray-400 mb-2",
  sessionExerciseNote: "text-sm italic text-gray-700 dark:text-gray-300 mb-2",
  noSetsText: "text-center text-gray-500 dark:text-gray-400 mt-2",
  noSessionExercisesText: "text-center text-gray-500 dark:text-gray-400 mt-4 text-base",
};

export const dropdown = {
  // The text input for the dropdown uses form.textInput
  container: "absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg z-10 mt-1",
  item: "p-3 border-b border-gray-200 dark:border-gray-700",
  itemText: "text-gray-900 dark:text-gray-200",
};

export const table = {
  headerContainer: "flex-row p-4 bg-gray-100 dark:bg-gray-700",
  headerText: "flex-1 font-bold text-gray-900 dark:text-gray-100",
  rowContainer: "flex-row p-4 border-b border-gray-200 dark:border-gray-700",
  rowText: "flex-1 text-gray-900 dark:text-gray-200",
};

export const set = {
  container: "flex-row flex-wrap justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mt-2",
  input: "border border-gray-300 dark:border-gray-600 p-2 rounded-lg mb-1 w-[48%] text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800",
  button: "p-2 rounded-lg items-center justify-center w-full mt-1",
  buttonText: "text-white font-bold text-sm",
  completedButton: "bg-green-600",
  incompleteButton: "bg-red-600",
};

export const card = {
  container: "flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full",
  image: "w-12 h-12 rounded-full mr-4",
  text: "text-lg font-bold text-gray-900 dark:text-gray-100 flex-1",
  indicator: "h-full bg-blue-500 absolute left-0 rounded-full",
};

export const fixed = {
  bottomButtonContainer: "absolute bottom-0 left-0 right-0 p-5 bg-gray-100 dark:bg-gray-900",
};

export const header = {
  container: "flex-row items-center justify-between p-4 bg-gray-900 dark:bg-black",
  icon: "w-10 h-10 rounded-full bg-gray-700 mr-3",
  exerciseName: "text-xl font-bold text-white",
  exerciseSubName: "text-lg text-gray-400",
  optionsIcon: "text-white text-2xl",
};

export const notes = {
  textInput: "border border-gray-700 p-3 m-4 rounded-lg bg-gray-800 text-white placeholder-gray-500",
};

export const timer = {
  container: "flex-row items-center justify-center p-3 m-4 bg-gray-800 rounded-lg",
  icon: "text-white text-xl mr-2",
  text: "text-white text-lg",
  statusOff: "text-blue-400 font-bold ml-2",
};

export const setTable = {
  container: "flex-1 mx-4 mb-4 rounded-lg overflow-hidden",
  headerRow: "flex-row bg-gray-800 p-3",
  headerCell: "text-white font-bold text-center flex-1",
  dataRow: "flex-row bg-gray-700 border-b border-gray-600 p-3 items-center",
  dataCell: "text-white text-center flex-1",
  input: "border border-gray-600 p-2 rounded-lg text-white bg-gray-800 flex-1 mx-1",
  checkmark: "text-green-400 text-2xl",
  setNumberButton: "bg-blue-600 rounded-md px-3 py-1",
  setNumberButtonText: "text-white font-bold",
};

export const setDropdown = {
  container: "absolute bg-gray-700 rounded-lg shadow-lg z-10 w-40",
  item: "p-3 border-b border-gray-600",
  itemText: "text-white text-center",
  removeText: "text-red-400 text-center",
};

export const workout = {
  exerciseBlockContainer: "mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow",
  exerciseName: "text-xl font-bold text-gray-900 dark:text-gray-100 mb-3",
  tableHeaderContainer: "flex-row justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700",
  tableHeaderText: "text-sm font-semibold text-gray-600 dark:text-gray-400 w-1/4 text-center",
  setRowContainer: "flex-row justify-between items-center mb-2",
  setTypeButton: "w-1/5",
  setTypeText: "text-gray-900 dark:text-gray-100 text-center",
  setInput: "border border-gray-300 dark:border-gray-600 p-2 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-1/4 text-center",
  setCheckButton: "w-1/5 items-center",
  addExerciseButton: "bg-blue-600 p-4 rounded-lg items-center my-4",
  noExercisesText: "text-center text-gray-500 dark:text-gray-400 mt-4",
};