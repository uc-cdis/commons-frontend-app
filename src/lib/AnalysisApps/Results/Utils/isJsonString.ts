/**
 * Determines whether the given input is a valid JSON string.
 *
 * This function checks if the provided input is a string and attempts to parse it
 * as JSON. If the parsing is successful and the result is a non-null object, the
 * function returns true. Otherwise, it returns false.
 *
 * @param {unknown} str - The input to validate as a JSON string.
 * @returns {boolean} - Returns `true` if the input is a valid JSON string, otherwise `false`.
 */
const IsJsonString = (str: unknown): boolean => {
  // Ensure the input is a string
  if (typeof str !== 'string') return false;

  try {
    // Parse the string
    const parsed = JSON.parse(str);

    // Check if the parsed value is a non-null object (optional stricter JSON validation)
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    // Parsing failed; return false
    return false;
  }
};

export default IsJsonString;
