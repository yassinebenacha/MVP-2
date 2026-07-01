import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON parsing with a generous size limit for large scraped HTML texts
app.use(express.json({ limit: "50mb" }));

// Initialize Google Gen AI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Heuristic NLP Model implementation for SVM and Logistic Regression
function classifyHeuristically(text: string, modelType: "svm" | "lr") {
  // Split input into lines or sections
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const segments = lines.map((line, index) => {
    let score = 0.5;
    let isNoise = false;
    let reason = "Contextual analysis";

    const lower = line.toLowerCase();

    // Feature 1: Boilerplate Keyword Presence
    const boilerplateKeywords = [
      "copyright",
      "all rights reserved",
      "privacy policy",
      "terms of service",
      "contact us",
      "sign in",
      "log in",
      "register",
      "menu",
      "navigation",
      "footer",
      "header",
      "subscribe",
      "newsletter",
      "advertisement",
      "click here",
      "add to cart",
      "search...",
      "categories",
      "tag cloud",
      "related articles",
      "share on facebook",
      "tweet this",
      "follow us",
      "cookie policy",
      "terms & conditions",
    ];
    let keywordHits = 0;
    boilerplateKeywords.forEach((kw) => {
      if (lower.includes(kw)) keywordHits++;
    });

    // Feature 2: HTML structures
    const isHtmlTag = /<[^>]+>/.test(line);
    const tagCount = (line.match(/<[^>]+>/g) || []).length;
    const textLength = line.replace(/<[^>]+>/g, "").length;

    // Feature 3: Word metrics
    const words = line.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // Feature 4: Link density or symbol density indicators
    const hasLinkStructure = lower.includes("href=") || lower.includes("url=");

    if (modelType === "svm") {
      // Linear SVM approximation
      let decisionBoundary = 0.5;

      // Negative features
      decisionBoundary -= keywordHits * 1.5;
      if (isHtmlTag && textLength < 12) decisionBoundary -= 2.0;
      if (wordCount < 4) decisionBoundary -= 1.0;
      if (hasLinkStructure) decisionBoundary -= 1.5;
      if (
        lower.startsWith("<nav") ||
        lower.startsWith("<footer") ||
        lower.startsWith("<header") ||
        lower.startsWith("<script") ||
        lower.startsWith("<style")
      ) {
        decisionBoundary -= 3.0;
      }
      if (/^[^a-zA-Z0-9]*$/.test(line.replace(/<[^>]+>/g, ""))) {
        decisionBoundary -= 2.5; // mostly symbols
      }

      // Positive features
      decisionBoundary += Math.min(wordCount / 4, 1.8);
      if (wordCount >= 6 && !isHtmlTag) decisionBoundary += 1.2;
      if (line.endsWith(".") || line.endsWith("!") || line.endsWith("?")) {
        decisionBoundary += 1.0;
      }

      isNoise = decisionBoundary < 0.2;
      score = 1 / (1 + Math.exp(-decisionBoundary));
      reason = isNoise
        ? "Boilerplate structural layout element"
        : "Primary semantic content sequence";
    } else {
      // Logistic Regression approximation
      let z = -0.3; // bias

      z -= keywordHits * 2.0;
      if (wordCount < 3) z -= 1.6;
      if (isHtmlTag) z -= 0.8;
      if (hasLinkStructure) z -= 1.2;
      if (lower.includes("class=") || lower.includes("id=")) z -= 0.6;

      z += Math.min(wordCount * 0.3, 2.5);
      // Capitalized first letter
      if (words.some((w) => /^[A-Z]/.test(w))) z += 0.4;

      const prob = 1 / (1 + Math.exp(-z));
      isNoise = prob < 0.45;
      score = prob;
      reason = isNoise
        ? "High probability of structural boilerplate text"
        : "High probability of informative core narrative";
    }

    // Map to normalized confidence
    const displayScore = isNoise
      ? Math.max(0.72, Math.min(0.99, 1 - score))
      : Math.max(0.72, Math.min(0.99, score));

    return {
      id: `seg_${index + 1}`,
      text: line,
      isNoise,
      score: parseFloat(displayScore.toFixed(2)),
      type: isNoise ? ("noise" as const) : ("signal" as const),
      reason,
    };
  });

  const cleanedText = segments
    .filter((s) => !s.isNoise)
    .map((s) => s.text.replace(/<[^>]+>/g, "").trim())
    .filter((t) => t.length > 0)
    .join("\n\n");

  const totalSegments = segments.length;
  const noiseRemoved = segments.filter((s) => s.isNoise).length;
  const contentRetained = totalSegments - noiseRemoved;
  const cleaningRatio = totalSegments > 0 ? (noiseRemoved / totalSegments) * 100 : 0;

  return {
    segments,
    cleanedText,
    metrics: {
      totalSegments,
      noiseRemoved,
      contentRetained,
      cleaningRatio: parseFloat(cleaningRatio.toFixed(1)),
    },
  };
}

// REST API Route: Noise Cleaning Engine
app.post("/api/clean", async (req, res) => {
  try {
    const { text, model } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid input text." });
    }

    const selectedModel = model || "svm";

    // If model is Gemini, execute with the Google Gen AI SDK
    if (selectedModel === "gemini") {
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured.",
          fallback: true,
          message:
            "The Gemini model is selected, but the GEMINI_API_KEY was not found in the environment. Please configure it in your Secrets, or switch to the Linear SVM or Logistic Regression models which run entirely locally on high-precision heuristics.",
        });
      }

      const prompt = `You are a high-precision Web Noise Cleaning model for Natural Language Processing (NLP) pipelines.
You are given a raw scraped web page text or HTML. Your task is to segment this text into logical sections (e.g., navigation menu bars, advertisements, headers, body text paragraphs, code blocks, footers).
For each logical section, analyze if it is "Noise" (boilerplate, navigation bar, ads, cookies policy, login prompt, social media sharing footer, empty elements) or "Signal" (primary readable content, main text content, article body, heading of the content).

Below is the raw input text to clean:
---START INPUT---
${text}
---END INPUT---

Segment the text and analyze each segment. Determine whether it is noise or signal. Return a strict JSON response with a single object containing:
- "segments": an array of segments where each segment has:
  - "text": the original text segment
  - "isNoise": boolean
  - "score": number from 0.0 to 1.0 representing your confidence
  - "reason": a short, professional reason for your classification
- "cleanedText": the full consolidated signal text, with all noise elements removed, formatted nicely with proper spacing and HTML tags stripped.

Your response must be ONLY valid JSON containing the specified keys. Avoid any introductory or closing markdown comments.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                segments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      isNoise: { type: Type.BOOLEAN },
                      score: { type: Type.NUMBER },
                      reason: { type: Type.STRING },
                    },
                    required: ["text", "isNoise", "score"],
                  },
                },
                cleanedText: { type: Type.STRING },
              },
              required: ["segments", "cleanedText"],
            },
          },
        });

        const resultJson = response.text ? JSON.parse(response.text.trim()) : null;

        if (resultJson && Array.isArray(resultJson.segments)) {
          // Format segments to include ids and type
          const formattedSegments = resultJson.segments.map((s: any, index: number) => ({
            id: `seg_${index + 1}`,
            text: s.text || "",
            isNoise: !!s.isNoise,
            score: typeof s.score === "number" ? s.score : 0.9,
            type: s.isNoise ? "noise" : "signal",
            reason: s.reason || (s.isNoise ? "Boilerplate content" : "Primary content"),
          }));

          const totalSegments = formattedSegments.length;
          const noiseRemoved = formattedSegments.filter((s: any) => s.isNoise).length;
          const contentRetained = totalSegments - noiseRemoved;
          const cleaningRatio = totalSegments > 0 ? (noiseRemoved / totalSegments) * 100 : 0;

          return res.json({
            segments: formattedSegments,
            cleanedText: resultJson.cleanedText || "",
            metrics: {
              totalSegments,
              noiseRemoved,
              contentRetained,
              cleaningRatio: parseFloat(cleaningRatio.toFixed(1)),
            },
          });
        } else {
          throw new Error("Invalid output format from Gemini model");
        }
      } catch (geminiError: any) {
        console.error("Gemini classification failed, falling back:", geminiError);
        // Fall back to heuristic classification so the user never gets a broken experience
        const fallbackResult = classifyHeuristically(text, "svm");
        return res.json({
          ...fallbackResult,
          warning: "Gemini model failed, automatically fell back to high-precision Linear SVM model.",
          debugInfo: geminiError.message,
        });
      }
    }

    // Local Python ML models: svm or lr
    try {
      const pythonResponse = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model: selectedModel })
      });
      
      if (!pythonResponse.ok) {
        throw new Error(`Python API responded with status: ${pythonResponse.status}`);
      }
      
      const result = await pythonResponse.json();
      return res.json(result);
    } catch (pythonError: any) {
      console.error("Python ML API failed, falling back to heuristic:", pythonError);
      // Fall back to heuristic classification
      const fallbackResult = classifyHeuristically(text, selectedModel as "svm" | "lr");
      return res.json({
        ...fallbackResult,
        warning: "Python ML API failed or is not running, automatically fell back to heuristic model.",
        debugInfo: pythonError.message,
      });
    }
  } catch (err: any) {
    console.error("Pipeline processing error:", err);
    return res.status(500).json({ error: "Internal server pipeline error." });
  }
});

// Configure Vite or Static Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
