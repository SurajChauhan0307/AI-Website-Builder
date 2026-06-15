import extractJson from "./extractJson.js";

export const generateResponse = async (prompt) => {
  try {
    // Sanity safety check for Render dashboard settings
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("Missing OPENROUTER_API_KEY in server environment variables panel.");
    }

    const res = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai-website-builder-nine-weld.vercel.app", 
          "X-Title": "Promptic AI Builder"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat", 
          messages: [
            {
              role: "system",
              content: "Return ONLY valid JSON object representing a website template schema. No explanations, no markdown code blocks, no backticks.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!res.ok) {
      let errorMessage = `HTTP Error Status: ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData?.error?.message || errorMessage;
      } catch (e) {
        errorMessage = await res.text();
      }
      throw new Error(`OpenRouter API Failure: ${errorMessage}`);
    }

    const data = await res.json();

    if (!data || !data.choices || data.choices.length === 0) {
      throw new Error("Invalid or empty response choice array returned from OpenRouter endpoints.");
    }

    const text = data.choices[0]?.message?.content;

    if (!text) {
      throw new Error("Empty AI response text body layout data wrapper received.");
    }

    // Call our corrected synchronous parsing utility
    const parsed = extractJson(text);

    if (!parsed) {
      throw new Error(`AI generated string text data, but failed to parse into schema JSON. Raw preview: ${text.substring(0, 100)}...`);
    }

    return parsed;
  } catch (err) {
    console.error("❌ ERROR inside generateResponse.js pipeline:", err.message);
    throw err; 
  }
};