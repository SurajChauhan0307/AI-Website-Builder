import { generateResponse } from "../utils/generateResponse.js";
import { User }    from "../models/userModel.js";
import { Website } from "../models/websiteModel.js";

// ─── Master Prompt ────────────────────────────────────────────────────────────
// KEY FIX: Output format uses delimiter tags — NOT JSON.
// HTML always contains double-quote characters (href="", type="text", etc.)
// which break JSON.parse. Delimiter tags are 100% immune to this.
const masterPrompt = `
YOU ARE A SENIOR FRONTEND ENGINEER.
Build a complete, responsive, production-quality website using ONLY HTML, CSS, and JavaScript.

REQUIREMENTS:
- Premium, modern design (no templates, no basic layouts)
- Fully responsive (mobile-first, flexbox/grid, media queries)
- Real content (no lorem ipsum, no placeholders)
- Smooth animations and hover effects
- All CSS inline in <style> tag inside <head>
- All JS inline in <script> tag before </body>
- Single self-contained HTML file

USER REQUEST:
{USER_PROMPT}

════════════════════════════════════════════════
OUTPUT FORMAT — FOLLOW EXACTLY, NO EXCEPTIONS:
════════════════════════════════════════════════

PROMPTIC_MESSAGE_START
Write one short sentence confirming what you built.
PROMPTIC_MESSAGE_END
PROMPTIC_CODE_START
<!DOCTYPE html>
<html lang="en">
...your complete website code here...
</html>
PROMPTIC_CODE_END

CRITICAL RULES:
- Do NOT use JSON
- Do NOT use markdown or backticks
- Do NOT write anything outside the delimiter tags
- The code block must start with <!DOCTYPE html> and end with </html>
`;

const updatePrompt = `
YOU ARE A SENIOR FRONTEND ENGINEER.
Update the website below based on the user's request.

CURRENT WEBSITE CODE:
{CURRENT_CODE}

USER REQUEST:
{USER_PROMPT}

════════════════════════════════════════════════
OUTPUT FORMAT — FOLLOW EXACTLY, NO EXCEPTIONS:
════════════════════════════════════════════════

PROMPTIC_MESSAGE_START
Write one short sentence confirming what you changed.
PROMPTIC_MESSAGE_END
PROMPTIC_CODE_START
<!DOCTYPE html>
<html lang="en">
...complete updated website code here...
</html>
PROMPTIC_CODE_END

CRITICAL RULES:
- Do NOT use JSON
- Do NOT use markdown or backticks
- Do NOT write anything outside the delimiter tags
- Return the COMPLETE updated HTML file, not just the changed parts
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function callAI(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await generateResponse(prompt);
      if (result?.code && result?.message) return result;
      console.warn(`Attempt ${i + 1}: AI returned incomplete data`);
    } catch (err) {
      console.error(`Attempt ${i + 1} error:`, err.message);
      if (i === retries - 1) throw err;
      // Wait 2s before retry
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

// ─── Generate Website ─────────────────────────────────────────────────────────
export const generateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Atomic credit deduction — prevents race conditions
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, credits: { $gte: 10 } },
      { $inc: { credits: -10 } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({ message: "Insufficient credits. Please purchase more." });
    }

    const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt.trim());
    const parsed = await callAI(finalPrompt);

    if (!parsed?.code || !parsed?.message) {
      // Refund credits on AI failure
      await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 10 } });
      return res.status(500).json({
        message: "AI failed to generate the website. Your credits have been refunded. Please try again with a more detailed description.",
      });
    }

    const website = await Website.create({
      user:         req.user._id,
      title:        prompt.trim().slice(0, 60),
      latestCode:   parsed.code,
      conversation: [
        { role: "user", content: prompt.trim() },
        { role: "ai",   content: parsed.message },
      ],
    });

    return res.status(201).json({
      websiteId:        website._id,
      remainingCredits: updatedUser.credits,
    });

  } catch (error) {
    console.error("generateWebsite error:", error.message);
    // Try to refund if we can identify the user
    try {
      if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 10 } });
      }
    } catch { /* non-critical */ }
    return res.status(500).json({ message: "Server error. Credits refunded if deducted." });
  }
};

// ─── Update / Chat ────────────────────────────────────────────────────────────
export const changeWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
    if (!website) {
      return res.status(404).json({ message: "Website not found" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, credits: { $gte: 5 } },
      { $inc: { credits: -5 } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({ message: "Insufficient credits. Please purchase more." });
    }

    const finalPrompt = updatePrompt
      .replace("{CURRENT_CODE}", website.latestCode)
      .replace("{USER_PROMPT}", prompt.trim());

    const parsed = await callAI(finalPrompt);

    if (!parsed?.code || !parsed?.message) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 5 } });
      return res.status(500).json({
        message: "AI update failed. Your credits have been refunded.",
      });
    }

    website.conversation.push(
      { role: "user", content: prompt.trim() },
      { role: "ai",   content: parsed.message }
    );
    website.latestCode = parsed.code;
    await website.save();

    return res.status(200).json({
      message:          parsed.message,
      code:             parsed.code,
      remainingCredits: updatedUser.credits,
    });

  } catch (error) {
    console.error("changeWebsite error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Get by ID ────────────────────────────────────────────────────────────────
export const getWebsiteById = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
    if (!website) return res.status(404).json({ message: "Website not found" });
    return res.status(200).json(website);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Get All ──────────────────────────────────────────────────────────────────
export const getAllWebsite = async (req, res) => {
  try {
    const websites = await Website.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(websites);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Deploy ───────────────────────────────────────────────────────────────────
export const deployWebsite = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
    if (!website) return res.status(404).json({ message: "Website not found" });

    if (!website.slug) {
      const base = website.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "site";

      website.slug =
        base + "-" + Date.now().toString(36) + website._id.toString().slice(-4);
    }

    const frontendUrl =
      process.env.FRONTEND_URL || "https://ai-website-builder-nine-weld.vercel.app";

    website.deployed  = true;
    website.deployUrl = `${frontendUrl}/site/${website.slug}`;
    await website.save();

    return res.status(200).json({ url: website.deployUrl });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Get by Slug (PUBLIC) ─────────────────────────────────────────────────────
export const getBySlug = async (req, res) => {
  try {
    const website = await Website.findOne({ slug: req.params.slug });
    if (!website) {
      return res.status(404).json({ message: "Site not found or not yet deployed." });
    }
    return res.status(200).json(website);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};