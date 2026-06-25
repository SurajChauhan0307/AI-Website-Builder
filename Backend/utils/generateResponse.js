/**
 * generateResponse.js
 *
 * ROOT CAUSE OF "AI failed to generate" ERROR:
 * The old approach asked the AI to return HTML inside a JSON string value.
 * HTML always contains double-quote characters (attribute values like
 * type="email", href="#section", font-family: "Arial") which break
 * JSON.parse because those quotes are not escaped by the AI.
 *
 * THE FIX:
 * Use a custom delimiter format instead of JSON.
 * The AI returns the message and code between unique separator tags.
 * No JSON parsing involved — immune to any characters inside HTML.
 */
import { parseDelimited } from "./parseDelimited.js";

export const generateResponse = async (prompt) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL || "https://ai-website-builder-nine-weld.vercel.app",
      "X-Title": "Promptic AI Builder",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are a senior frontend engineer. 
Follow the OUTPUT FORMAT exactly.
Never use JSON. Never use markdown. Never add explanation outside the delimiters.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    }),
  });

  if (!res.ok) {
    let errMsg = `OpenRouter HTTP ${res.status}`;
    try {
      const errData = await res.json();
      errMsg = errData?.error?.message || errMsg;
    } catch {
      errMsg = (await res.text()) || errMsg;
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) throw new Error("Empty response from AI model.");

  const parsed = parseDelimited(text);

  if (!parsed) {
    // Log what we actually got to help debug
    console.error("parseDelimited failed. AI raw response (first 400 chars):", text.substring(0, 400));
    throw new Error("AI response did not match expected format.");
  }

  return parsed;
};