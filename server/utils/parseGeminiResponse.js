/**
 * Safely extracts and parses JSON from Gemini's response text.
 *
 * Gemini often wraps JSON in markdown code fences like:
 * ```json
 * { ... }
 * ```
 *
 * This utility handles that by stripping fences and finding the JSON boundaries.
 *
 * @param {string} text - Raw response text from Gemini
 * @returns {object|array} Parsed JSON
 * @throws {Error} If JSON cannot be extracted or parsed
 */
const parseGeminiResponse = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty or invalid Gemini response');
  }

  // Strip markdown code fences if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  // Try to find JSON object or array boundaries
  const objectStart = cleaned.indexOf('{');
  const arrayStart = cleaned.indexOf('[');

  let startIndex;
  let endChar;

  if (objectStart === -1 && arrayStart === -1) {
    throw new Error('No JSON object or array found in Gemini response');
  }

  if (objectStart === -1) {
    startIndex = arrayStart;
    endChar = ']';
  } else if (arrayStart === -1) {
    startIndex = objectStart;
    endChar = '}';
  } else {
    // Use whichever comes first
    startIndex = Math.min(objectStart, arrayStart);
    endChar = startIndex === objectStart ? '}' : ']';
  }

  // Find the matching closing bracket/brace from the end
  const endIndex = cleaned.lastIndexOf(endChar);
  if (endIndex <= startIndex) {
    throw new Error('Malformed JSON in Gemini response — mismatched brackets');
  }

  const jsonString = cleaned.substring(startIndex, endIndex + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Failed to parse Gemini JSON: ${err.message}`);
  }
};

export default parseGeminiResponse;
