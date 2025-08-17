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
};

export const list = {
  itemContainer: "flex-row items-center p-4 mb-2 bg-white dark:bg-gray-800 rounded-lg",
  itemText: "text-lg ml-4 text-gray-900 dark:text-gray-200",
  itemIcon: "text-gray-900 dark:text-gray-200",
  itemChevron: "text-gray-400 dark:text-gray-500",
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

export const card = {
  container: "flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full",
  image: "w-12 h-12 rounded-full mr-4",
  text: "text-lg font-bold text-gray-900 dark:text-gray-100 flex-1",
  indicator: "h-full bg-blue-500 absolute left-0 rounded-full",
};