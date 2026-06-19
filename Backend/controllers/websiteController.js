import { generateResponse } from "../config/openRouter.js";
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
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

--------------------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
--------------------------------------------------
✔ Mobile-first CSS
✔ Flexbox/Grid
✔ Media queries
✔ No horizontal scroll

--------------------------------------------------
OUTPUT FORMAT (RAW JSON ONLY)
--------------------------------------------------
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
RETURN RAW JSON ONLY
`;

export const generateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // atomic credit deduction (FIXED)
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, credits: { $gte: 10 } },
      { $inc: { credits: -10 } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt.trim());

    let parsed = null;
    let raw = "";

    for (let i = 0; i < 2 && !parsed; i++) {
      raw = await generateResponse(finalPrompt);
      parsed = await extractJson(raw);

      if (!parsed) {
        raw = await generateResponse(finalPrompt + "\nRETURN ONLY RAW JSON");
        parsed = await extractJson(raw);
      }
    }

    if (!parsed?.code || !parsed?.message) {
      return res.status(400).json({ message: "AI returned invalid response" });
    }

    const website = await Website.create({
      user: user._id,
      title: prompt.slice(0, 60),
      latestCode: parsed.code,
      conversation: [
        { role: "user", content: prompt },
        { role: "ai", content: parsed.message }
      ]
    });

    return res.status(201).json({
      websiteId: website._id,
      remainingCredits: updatedUser.credits
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getWebsiteById = async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!website) {
      return res.status(400).json({ message: "Website not found" });
    }

    return res.status(200).json(website);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const changeWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!website) {
      return res.status(400).json({ message: "Website not found" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, credits: { $gte: 5 } },
      { $inc: { credits: -5 } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    const updatePrompt = `
UPDATE THIS HTML WEBSITE.

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

RETURN RAW JSON ONLY:
{
  "message":"Short confirmation",
  "code":"<UPDATED FULL HTML>"
}
`;

    let parsed = null;
    let raw = "";

    for (let i = 0; i < 2 && !parsed; i++) {
      raw = await generateResponse(updatePrompt);
      parsed = await extractJson(raw);

      if (!parsed) {
        raw = await generateResponse(updatePrompt + "\nRETURN ONLY RAW JSON");
        parsed = await extractJson(raw);
      }
    }

    if (!parsed?.code || !parsed?.message) {
      return res.status(400).json({ message: "AI returned invalid response" });
    }

    website.conversation.push(
      { role: "user", content: prompt },
      { role: "ai", content: parsed.message }
    );

    website.latestCode = parsed.code;
    await website.save();

    return res.status(200).json({
      message: parsed.message,
      code: parsed.code,
      remainingCredits: updatedUser.credits
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllWebsite = async (req, res) => {
  try {
    const websites = await Website.find({ user: req.user._id });
    return res.status(200).json(websites);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deployWebsite = async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!website) {
      return res.status(400).json({ message: "Website not found" });
    }

    if (!website.slug) {
      website.slug =
        website.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40) +
        "-" +
        Date.now().toString(36) +
        website._id.toString().slice(-4);
    }

    website.deployed = true;
    website.deployUrl = `${process.env.FRONTEND_URL}/site/${website.slug}`;

    await website.save();

    return res.status(200).json({
      url: website.deployUrl
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req, res) => {
  try {
    const website = await Website.findOne({
      slug: req.params.slug
    });

    if (!website) {
      return res.status(400).json({ message: "Website not found" });
    }

    return res.status(200).json(website);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};