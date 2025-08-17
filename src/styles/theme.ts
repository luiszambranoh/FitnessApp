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
  itemChevron: "text-gray-400",
};

export const dropdown = {
  // The text input for the dropdown uses form.textInput
  container: "absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg z-10 mt-1",
  item: "p-3 border-b border-gray-200 dark:border-gray-700",
  itemText: "text-gray-900 dark:text-gray-200",
};