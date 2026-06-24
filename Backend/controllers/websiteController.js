// ✅ FIX: Import from utils/generateResponse.js (returns parsed JSON object)
//    NOT from config/openRouter.js (that returns raw string)
import { generateResponse } from "../utils/generateResponse.js";
import { User } from "../models/userModel.js";
import { Website } from "../models/websiteModel.js";
import extractJson from "../utils/extractJson.js";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
✔ Mobile-first CSS
✔ Flexbox/Grid
✔ Media queries
✔ No horizontal scroll

OUTPUT FORMAT (RAW JSON ONLY — NO MARKDOWN, NO BACKTICKS):
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}
`;

// ─── Generate ─────────────────────────────────────────────────────────────────
export const generateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, credits: { $gte: 10 } },
      { $inc: { credits: -10 } },
      { new: true }
    );
    if (!updatedUser) return res.status(400).json({ message: "Insufficient credits" });

    const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt.trim());
    let parsed = null;

    for (let i = 0; i < 3 && !parsed; i++) {
      try { parsed = await generateResponse(finalPrompt); } catch (e) {
        console.error(`Generate attempt ${i + 1} failed:`, e.message);
      }
    }

    if (!parsed?.code || !parsed?.message) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 10 } });
      return res.status(500).json({ message: "AI failed to generate. Credits refunded." });
    }

    const website = await Website.create({
      user: req.user._id,
      title: prompt.slice(0, 60),
      latestCode: parsed.code,
      conversation: [
        { role: "user", content: prompt },
        { role: "ai",  content: parsed.message },
      ],
    });

    return res.status(201).json({
      websiteId: website._id,
      remainingCredits: updatedUser.credits,
    });
  } catch (error) {
    console.error("generateWebsite error:", error.message);
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

// ─── Update / chat ────────────────────────────────────────────────────────────
export const changeWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
    if (!website) return res.status(404).json({ message: "Website not found" });

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, credits: { $gte: 5 } },
      { $inc: { credits: -5 } },
      { new: true }
    );
    if (!updatedUser) return res.status(400).json({ message: "Insufficient credits" });

    const updatePrompt = `
UPDATE THIS HTML WEBSITE.

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

RETURN RAW JSON ONLY — NO MARKDOWN, NO BACKTICKS:
{
  "message": "Short confirmation",
  "code": "<UPDATED FULL HTML>"
}
`;
    let parsed = null;
    for (let i = 0; i < 3 && !parsed; i++) {
      try { parsed = await generateResponse(updatePrompt); } catch (e) {
        console.error(`Update attempt ${i + 1} failed:`, e.message);
      }
    }

    if (!parsed?.code || !parsed?.message) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 5 } });
      return res.status(500).json({ message: "AI update failed. Credits refunded." });
    }

    website.conversation.push(
      { role: "user", content: prompt },
      { role: "ai",  content: parsed.message }
    );
    website.latestCode = parsed.code;
    await website.save();

    return res.status(200).json({
      message: parsed.message,
      code: parsed.code,
      remainingCredits: updatedUser.credits,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Get all ──────────────────────────────────────────────────────────────────
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

    // Generate slug only if not already set
    if (!website.slug) {
      const base = website.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")   // keep hyphens, remove rest
        .replace(/^-+|-+$/g, "")        // trim leading/trailing hyphens
        .slice(0, 40);

      website.slug =
        (base || "site") +
        "-" +
        Date.now().toString(36) +
        website._id.toString().slice(-4);
    }

    // ✅ FIX: Read FRONTEND_URL from env — must be set on Render dashboard.
    // If missing, falls back to the Vercel app URL.
    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://ai-website-builder-nine-weld.vercel.app";

    website.deployed   = true;
    // ✅ FIX: URL path is /site/<slug> — matches App.jsx route "/site/:slug"
    website.deployUrl  = `${frontendUrl}/site/${website.slug}`;

    await website.save();

    return res.status(200).json({ url: website.deployUrl });
  } catch (error) {
    console.error("deployWebsite error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Get by slug (PUBLIC — no auth) ──────────────────────────────────────────
export const getBySlug = async (req, res) => {
  try {
    // ✅ FIX: Removed "deployed: true" filter — if slug exists the site should load.
    // The slug is only created at deploy time, so it being present is sufficient proof.
    const website = await Website.findOne({ slug: req.params.slug });

    if (!website) {
      return res.status(404).json({ message: "Site not found. It may not have been deployed yet." });
    }

    return res.status(200).json(website);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};