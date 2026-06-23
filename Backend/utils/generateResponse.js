import extractJson from "./extractJson.js";

export const generateResponse = async (prompt) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error(
        "Missing OPENROUTER_API_KEY — set it in your environment variables."
      );
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.FRONTEND_URL ||
          "https://ai-website-builder-nine-weld.vercel.app",
        "X-Title": "Promptic AI Builder",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "Return ONLY a valid JSON object. No markdown, no backticks, no explanation. Output must start with { and end with }.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData?.error?.message || errorMessage;
      } catch {
        errorMessage = await res.text();
      }
      throw new Error(`OpenRouter API Error: ${errorMessage}`);
    }

    const data = await res.json();

    if (!data?.choices?.length) {
      throw new Error("Empty choices array from OpenRouter");
    }

    const text = data.choices[0]?.message?.content;

    if (!text) {
      throw new Error("Empty AI response content");
    }

    // Parse the JSON from the AI response
    const parsed = extractJson(text);

    if (!parsed) {
      throw new Error(
        `Failed to parse AI response as JSON. Raw preview: ${text.substring(0, 200)}`
      );
    }

    return parsed;
  } catch (err) {
    console.error("❌ generateResponse error:", err.message);
    throw err;
  }
};