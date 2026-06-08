import User from "../models/userModels.js";
import Website from "../models/websiteModel.js";
import { generateResponse } from "../utils/generateResponse.js";

const fetchAndParseAIResponse = async (basePrompt) => {
    let parsed = null;

    for (let i = 0; i < 2; i++) {
        const currentPrompt =
            i === 0
                ? basePrompt
                : `${basePrompt}

RETURN ONLY RAW JSON.
DO NOT USE MARKDOWN.
DO NOT USE \`\`\`json`;

        parsed = await generateResponse(currentPrompt);

        if (parsed && parsed.code) {
            break;
        }
    }

    return parsed;
};

export const getWebsiteVersions = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!website) {
            return res.status(404).json({
                success: false,
                message: "Website not found"
            });
        }

        res.json(website.versions || []);
    } catch (error) {
        console.error("GET VERSIONS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error fetching versions."
        });
    }
};

export const changeWebsite = async (req, res) => {
    try {
        const { prompt } = req.body;

        // 1. Better upfront input defense
        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            });
        }

        // Diagnostic Log before external API calls
        console.log(`[PROCESS] Initiating update. Website ID: ${req.params.id} | Prompt: "${prompt.slice(0, 50)}..."`);

        const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
        if (!website) {
            return res.status(404).json({
                success: false,
                message: "Website not found"
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.credits < 5) {
            return res.status(400).json({
                success: false,
                message: "Not enough credits"
            });
        }

        // 2. Your Stronger Frontend Architect Prompt Implementation
        const updatePrompt = `
You are a Principal Frontend Architect and Senior UI/UX Engineer.

TASK:
Modify the existing website according to the user's request.

RULES:
1. Preserve all existing functionality.
2. Preserve responsiveness.
3. Do not remove sections unless explicitly requested.
4. Keep all JavaScript working.
5. Keep all CSS working.
6. Return the COMPLETE updated HTML document.
7. Never return partial code.
8. Never return markdown.
9. Return ONLY valid JSON.

CURRENT WEBSITE:
${website.latestCode}

USER REQUEST:
${prompt}

RESPONSE FORMAT:
{
  "message":"short confirmation",
  "code":"complete html document"
}
`;

        // 3. Make LLM API call
        const parsed = await fetchAndParseAIResponse(updatePrompt);

        if (!parsed || !parsed.code) {
            return res.status(422).json({
                success: false,
                message: "AI returned invalid response"
            });
        }

        // 4. Defensive Version History Append
        if (!website.versions) {
            website.versions = [];
        }

        website.versions.push({
            code: website.latestCode,
            prompt: prompt,
            createdAt: new Date()
        });

        // Update conversation timeline
        website.conversation.push(
            { role: "user", content: prompt },
            { role: "ai", content: parsed.message || "Website updated successfully." }
        );

        // Apply new code payload
        website.latestCode = parsed.code;
        await website.save();

        // 5. Finalize payment transactions securely
        user.credits -= 5;
        await user.save();

        return res.status(200).json({
            success: true,
            message: parsed.message || "Website updated successfully",
            code: parsed.code,
            remainingCredits: user.credits
        });

    } catch (error) {
        // 6. Upgraded Server Error Diagnostic Logs
        console.error("CHANGE WEBSITE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error during code modification."
        });
    }
};