/**
 * Robustly extracts and parses a JSON object from an AI response string.
 * Handles markdown code fences, leading/trailing text, and nested braces
 * inside HTML strings (the `code` field).
 */
const extractJson = (text) => {
  if (!text || typeof text !== "string") return null;

  // 1. Strip markdown code fences
  let cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // 2. Find the outermost JSON object using a depth counter
  //    This correctly handles { } inside string values (e.g. CSS / HTML in "code")
  const start = cleaned.indexOf("{");
  if (start === -1) {
    console.error("extractJson: No opening brace found in AI response");
    return null;
  }

  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) {
    console.error("extractJson: No matching closing brace found");
    return null;
  }

  const jsonString = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error(
      "extractJson: JSON.parse failed. Preview:",
      jsonString.substring(0, 200)
    );
    return null;
  }
};

export default extractJson;