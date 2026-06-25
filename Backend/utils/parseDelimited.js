/**
 * parseDelimited.js
 *
 * Parses the AI response using unique delimiter tags instead of JSON.
 * This is 100% immune to HTML quote characters breaking the parser.
 *
 * Expected AI output format:
 *
 * PROMPTIC_MESSAGE_START
 * Your confirmation message here.
 * PROMPTIC_MESSAGE_END
 * PROMPTIC_CODE_START
 * <!DOCTYPE html>
 * <html>...full website...</html>
 * PROMPTIC_CODE_END
 */
export const parseDelimited = (text) => {
  if (!text || typeof text !== "string") return null;

  const msgMatch  = text.match(/PROMPTIC_MESSAGE_START\s*([\s\S]*?)\s*PROMPTIC_MESSAGE_END/);
  const codeMatch = text.match(/PROMPTIC_CODE_START\s*([\s\S]*?)\s*PROMPTIC_CODE_END/);

  if (!msgMatch || !codeMatch) {
    // Fallback: try the old JSON approach in case model ignores delimiter format
    return tryJsonFallback(text);
  }

  const message = msgMatch[1].trim();
  const code    = codeMatch[1].trim();

  if (!code || !code.toLowerCase().includes("<html")) {
    return null;
  }

  return { message, code };
};

/**
 * Last-resort fallback: try to extract JSON if the AI ignored the delimiter format.
 * Uses the depth-counter approach that handles { } inside CSS/JS strings.
 */
function tryJsonFallback(text) {
  try {
    // Strip markdown fences
    let cleaned = text
      .replace(/^```json\s*/im, "")
      .replace(/^```\s*/im, "")
      .replace(/\s*```$/im, "")
      .trim();

    const start = cleaned.indexOf("{");
    if (start === -1) return null;

    let depth = 0, inString = false, escape = false, end = -1;

    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escape)        { escape = false; continue; }
      if (ch === "\\")   { escape = true;  continue; }
      if (ch === '"')    { inString = !inString; continue; }
      if (inString)      continue;
      if (ch === "{")    depth++;
      else if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
    }

    if (end === -1) return null;

    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (parsed?.code && parsed?.message) return parsed;
    return null;
  } catch {
    return null;
  }
}