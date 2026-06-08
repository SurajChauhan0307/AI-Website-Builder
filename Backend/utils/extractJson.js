const extractJson = (text) => {
    if (!text || typeof text !== "string") {
        return null;
    }

    try {
        const cleaned = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start === -1 || end === -1) {
            console.error("No JSON object found in response");
            return null;
        }

        const jsonString = cleaned.slice(start, end + 1);

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("JSON Parse Error:", error);
        console.error("Raw Response:", text);
        return null;
    }
};

export default extractJson;