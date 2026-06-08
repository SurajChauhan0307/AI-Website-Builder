import extractJson from "./extractJson.js";

export const generateResponse = async (prompt) => {
    try {
        const res = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: "Return ONLY valid JSON. No explanation. No markdown.",
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
            throw new Error(errorMessage);
        }

        const data = await res.json();

        if (!data || !data.choices || data.choices.length === 0) {
            throw new Error("Invalid response structure from API");
        }

        const text = data.choices[0]?.message?.content;

        if (!text) {
            throw new Error("Empty AI response");
        }

        const parsed = extractJson(text);

        if (!parsed) {
            throw new Error("AI returned invalid JSON");
        }

        return parsed;
    } catch (err) {
        console.error("generateResponse error:", err.message);
        return null;
    }
};