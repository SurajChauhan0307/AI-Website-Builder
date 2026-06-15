import extractJson from "./extractJson.js";

export const generateResponse = async (prompt) => {
    try {
        // ⚠️ SANITY CHECK: Instantly flags if Render is missing your environment variable
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error("Missing OPENROUTER_API_KEY in server environment variables.");
        }

        const res = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    // Optional OpenRouter ranking headers (highly recommended)
                    "HTTP-Referer": "https://ai-website-builder-nine-weld.vercel.app", 
                    "X-Title": "Promptic AI Builder"
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat", // 💡 Note: If this fails, try swapping to "meta-llama/llama-3.1-70b-instruct" as a test
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
            let errorMessage = `HTTP Error: ${res.status}`;
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
            throw new Error("Invalid response structure from OpenRouter API endpoints.");
        }

        const text = data.choices[0]?.message?.content;

        if (!text) {
            throw new Error("Empty AI response content wrapper received.");
        }

        const parsed = extractJson(text);

        if (!parsed) {
            throw new Error(`AI generated string, but failed to parse into valid JSON. Raw output: ${text.substring(0, 100)}...`);
        }

        return parsed;
    } catch (err) {
        // ✅ CRUCIAL: Keeps your server logs readable so you can diagnose issues in the Render Dashboard
        console.error("❌ ERROR inside generateResponse.js:", err.message);
        
        // Throw the error instead of returning null so your website controller knows why it failed
        throw err; 
    }
};