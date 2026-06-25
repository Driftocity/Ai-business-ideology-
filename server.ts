import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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
      model: "gemini-3.5-flash",
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
      model: "gemini-3.5-flash",
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
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in generate-plan API:", error);
    res.status(500).json({ error: error.message || "Failed to generate business plan." });
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
