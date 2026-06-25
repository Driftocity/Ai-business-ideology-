import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Lazy initialize GoogleGenAI client to avoid crash if API key is missing during boot
let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please verify your API keys under Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Validate Business Idea
app.post("/api/validate-idea", async (req, res) => {
  try {
    const { idea, industry, budget } = req.body;
    if (!idea || !industry || !budget) {
      res.status(400).json({ error: "Missing required fields: idea, industry, budget" });
      return;
    }

    const ai = getAi();
    const prompt = `You are an expert startup advisor and business mentor. Analyze this business idea thoroughly and write a direct, honest, highly practical, and encouraging evaluation.
Cover:
1. Market Demand: Does the idea solve a real, pressing problem? Is the demand sustainable?
2. Core Opportunity: What is the biggest, most exciting growth potential or unfair advantage this concept has?
3. Key Risk: What is the main threat or operational/financial bottleneck they must watch out for?

Keep your advice professional, actionable, and structured in 3 clear, flowing paragraphs (around 200 words total). Do not write any markdown headers or bullet points; keep it conversational, specific, and direct.

Business Idea: ${idea}
Industry: ${industry}
Budget: ${budget}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in validate-idea API:", error);
    res.status(500).json({ error: error.message || "Failed to analyze business idea." });
  }
});

// 2. Analyze Target Market
app.post("/api/analyze-market", async (req, res) => {
  try {
    const { idea, industry, customer, problem } = req.body;
    if (!idea || !industry || !customer || !problem) {
      res.status(400).json({ error: "Missing required fields: idea, industry, customer, problem" });
      return;
    }

    const ai = getAi();
    const prompt = `You are a seasoned market research expert. Write a clear, practical, and highly specific target market analysis.
Cover:
1. Ideal Customer Profile (ICP): Who exactly is the ideal customer? List their key demographic and psychographic traits.
2. Market Size & Reachability: How large is this addressable market, and is it cost-effective to reach them?
3. Customer Acquisition Strategy: What is the single most efficient, budget-friendly channel or strategy to find and convert these specific customers?

Keep it practical, highly customized to the business concept, and structured in 3 clear, flowing paragraphs (around 180 words total). Do not use any markdown headers; keep the tone advisory and direct.

Business Idea: ${idea}
Industry: ${industry}
Target Customer Type: ${customer}
Core Problem Solved: ${problem}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in analyze-market API:", error);
    res.status(500).json({ error: error.message || "Failed to analyze target market." });
  }
});

// 3. Generate Full Business Plan
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { idea, industry, budget, customer, problem } = req.body;
    if (!idea || !industry || !budget || !customer || !problem) {
      res.status(400).json({ error: "Missing required fields: idea, industry, budget, customer, problem" });
      return;
    }

    const ai = getAi();
    const prompt = `You are an elite business consultant. Write a detailed, comprehensive, and highly actionable business plan customized to the provided parameters.
Use these exact section labels in ALL CAPS, each on its own line, followed by a colon:

REVENUE MODEL:
PRICING STRATEGY:
90-DAY LAUNCH ROADMAP:
COMPETITOR LANDSCAPE:
YOUR UNIQUE ANGLE:
MARKETING CHANNELS:
FIRST 5 ACTION STEPS:

Business Idea: ${idea}
Industry: ${industry}
Startup Budget: ${budget}
Target Customer: ${customer}
Problem Solved: ${problem}

Be incredibly specific and practical. Avoid generic filler. For example, suggest real pricing figures, specific marketing tactics suitable for the budget, and exact steps. Each section should have 3-6 sentences or clear bullet points. Total length should be around 500-600 words. Write like a deeply caring mentor who wants them to succeed.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in generate-plan API:", error);
    res.status(500).json({ error: error.message || "Failed to generate business plan." });
  }
});

// 4. Generate SWOT Analysis
app.post("/api/generate-swot", async (req, res) => {
  try {
    const { idea, industry, customer, problem } = req.body;
    if (!idea || !industry || !customer || !problem) {
      res.status(400).json({ error: "Missing required fields: idea, industry, customer, problem" });
      return;
    }

    const ai = getAi();
    const prompt = `Conduct a comprehensive, highly realistic SWOT Analysis for this business idea.
Venture: ${idea}
Industry: ${industry}
Target Customer: ${customer}
Pain Point: ${problem}

Produce exactly 4 key, highly professional points for each of the four SWOT categories:
- Strengths (Internal advantages, unique intellectual assets, capital efficiency)
- Weaknesses (Internal limitations, resource constraints, high friction areas)
- Opportunities (External growth drivers, tech tailwinds, regulatory shifts, adjacent markets)
- Threats (External risks, aggressive competitors, economic downturns, customer retention issues)

Ensure each point is actionable, concise (10-15 words), and tailored exactly to this business.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 key internal strengths"
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 key internal weaknesses"
            },
            opportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 key external opportunities"
            },
            threats: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 key external threats"
            }
          },
          required: ["strengths", "weaknesses", "opportunities", "threats"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in generate-swot API:", error);
    res.status(500).json({ error: error.message || "Failed to conduct SWOT analysis." });
  }
});

// 5. Generate Investor Pitch & Cold Outreach
app.post("/api/generate-pitch", async (req, res) => {
  try {
    const { idea, industry, customer, problem, tone } = req.body;
    if (!idea || !industry || !customer || !problem || !tone) {
      res.status(400).json({ error: "Missing required fields: idea, industry, customer, problem, tone" });
      return;
    }

    const ai = getAi();
    const prompt = `Craft an elite, highly converting spoken Elevator Pitch (30 seconds) and an Investor/Partner Cold Outreach Email for this startup.
Venture: ${idea}
Industry: ${industry}
Target Customer: ${customer}
Problem Solved: ${problem}
Required Tone: ${tone} (e.g. bold, visionary, data-driven, casual but professional)

Make the Elevator Pitch memorable, punchy, starting with a powerful hook.
Make the Cold Outreach Email extremely direct, with a clear value proposition, an engaging subject line, and a single friction-free call-to-action (CTA). Avoid generic fluff. Make sure both reflect the specified tone.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            elevatorPitch: {
              type: Type.STRING,
              description: "The spoken 30-second elevator pitch starting with a hook"
            },
            coldEmail: {
              type: Type.STRING,
              description: "An investor-ready cold outreach email with subject line and call-to-action"
            }
          },
          required: ["elevatorPitch", "coldEmail"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in generate-pitch API:", error);
    res.status(500).json({ error: error.message || "Failed to generate elevator pitch and email." });
  }
});

// 6. Interactive Advisor Chat (Q&A with Plan)
app.post("/api/chat-plan", async (req, res) => {
  try {
    const { message, planContext, chatHistory } = req.body;
    if (!message || !planContext) {
      res.status(400).json({ error: "Missing required fields: message, planContext" });
      return;
    }

    const ai = getAi();
    const historyPrompt = chatHistory && chatHistory.length > 0
      ? chatHistory.map((ch: any) => `${ch.role === "user" ? "Founder" : "AI Consultant"}: ${ch.text}`).join("\n")
      : "";

    const prompt = `You are the lead startup architect and co-pilot at LaunchMind. You have constructed a comprehensive business plan and are now chatting with the founder.
    
Here is the business context & plan:
${planContext}

${historyPrompt ? `Here is the current conversation history:\n${historyPrompt}\n` : ""}
Founder's Question: "${message}"

Write a concise, extremely high-value, highly specific, and practical response (max 3 short paragraphs or clean bullet points). Give actual, direct tactical ideas, slogans, or channel structures. Do not speak in vague generalities. Be encouraging and direct.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in chat-plan API:", error);
    res.status(500).json({ error: error.message || "Failed to consult with business plan." });
  }
});

// Export default app for Vercel/Serverless deployment
export default app;

// Setup local dev or standalone container server (only if Vercel isn't serving)
if (!process.env.VERCEL) {
  const PORT = 3000;
  const distPath = path.join(process.cwd(), "dist");
  const useStatic = process.env.NODE_ENV === "production" || !fs.existsSync(path.join(process.cwd(), "src/main.tsx"));

  const boot = async () => {
    if (!useStatic) {
      try {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } catch (e) {
        console.warn("Vite development server failed to initialize; falling back to serving static build:", e);
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    } else {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  };

  boot().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
