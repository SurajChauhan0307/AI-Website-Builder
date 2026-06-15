const extractJson = (text) => {
  if (!text) {
    return null;
  }

  // 1. Clean potential markdown blocks or backticks from AI string response
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // 2. Locate boundaries of the JSON object
  const openBracket = cleaned.indexOf('{');
  const closeBracket = cleaned.lastIndexOf('}');

  if (openBracket === -1 || closeBracket === -1) {
    console.error("❌ extractJson Error: Could not find valid opening or closing curly brackets in AI response string.");
    return null;
  }

  const jsonString = cleaned.slice(openBracket, closeBracket + 1);

  try {
    // 3. Safely parse data without crashing the Node engine
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error("❌ extractJson Error: JSON.parse failed. Raw chunk context was:", jsonString.substring(0, 150));
    return null;
  }
};

export default extractJson;