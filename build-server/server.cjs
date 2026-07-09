var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = parseInt(process.env.PORT || "3000", 10);
app.use(import_express.default.json({ limit: "50mb" }));
var apiKey = process.env.GEMINI_API_KEY;
var ai = apiKey ? new import_genai.GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
function classifyHeuristically(text, modelType) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter((l) => l.length > 0);
  const segments = lines.map((line, index) => {
    let score = 0.5;
    let isNoise = false;
    let reason = "Contextual analysis";
    const lower = line.toLowerCase();
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
      "terms & conditions"
    ];
    let keywordHits = 0;
    boilerplateKeywords.forEach((kw) => {
      if (lower.includes(kw)) keywordHits++;
    });
    const isHtmlTag = /<[^>]+>/.test(line);
    const tagCount = (line.match(/<[^>]+>/g) || []).length;
    const textLength = line.replace(/<[^>]+>/g, "").length;
    const words = line.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;
    const hasLinkStructure = lower.includes("href=") || lower.includes("url=");
    if (modelType === "svm") {
      let decisionBoundary = 0.5;
      decisionBoundary -= keywordHits * 1.5;
      if (isHtmlTag && textLength < 12) decisionBoundary -= 2;
      if (wordCount < 4) decisionBoundary -= 1;
      if (hasLinkStructure) decisionBoundary -= 1.5;
      if (lower.startsWith("<nav") || lower.startsWith("<footer") || lower.startsWith("<header") || lower.startsWith("<script") || lower.startsWith("<style")) {
        decisionBoundary -= 3;
      }
      if (/^[^a-zA-Z0-9]*$/.test(line.replace(/<[^>]+>/g, ""))) {
        decisionBoundary -= 2.5;
      }
      decisionBoundary += Math.min(wordCount / 4, 1.8);
      if (wordCount >= 6 && !isHtmlTag) decisionBoundary += 1.2;
      if (line.endsWith(".") || line.endsWith("!") || line.endsWith("?")) {
        decisionBoundary += 1;
      }
      isNoise = decisionBoundary < 0.2;
      score = 1 / (1 + Math.exp(-decisionBoundary));
      reason = isNoise ? "Boilerplate structural layout element" : "Primary semantic content sequence";
    } else {
      let z = -0.3;
      z -= keywordHits * 2;
      if (wordCount < 3) z -= 1.6;
      if (isHtmlTag) z -= 0.8;
      if (hasLinkStructure) z -= 1.2;
      if (lower.includes("class=") || lower.includes("id=")) z -= 0.6;
      z += Math.min(wordCount * 0.3, 2.5);
      if (words.some((w) => /^[A-Z]/.test(w))) z += 0.4;
      const prob = 1 / (1 + Math.exp(-z));
      isNoise = prob < 0.45;
      score = prob;
      reason = isNoise ? "High probability of structural boilerplate text" : "High probability of informative core narrative";
    }
    const displayScore = isNoise ? Math.max(0.72, Math.min(0.99, 1 - score)) : Math.max(0.72, Math.min(0.99, score));
    return {
      id: `seg_${index + 1}`,
      text: line,
      isNoise,
      score: parseFloat(displayScore.toFixed(2)),
      type: isNoise ? "noise" : "signal",
      reason
    };
  });
  const cleanedText = segments.filter((s) => !s.isNoise).map((s) => s.text.replace(/<[^>]+>/g, "").trim()).filter((t) => t.length > 0).join("\n\n");
  const totalSegments = segments.length;
  const noiseRemoved = segments.filter((s) => s.isNoise).length;
  const contentRetained = totalSegments - noiseRemoved;
  const cleaningRatio = totalSegments > 0 ? noiseRemoved / totalSegments * 100 : 0;
  return {
    segments,
    cleanedText,
    metrics: {
      totalSegments,
      noiseRemoved,
      contentRetained,
      cleaningRatio: parseFloat(cleaningRatio.toFixed(1))
    }
  };
}
app.post("/api/clean", async (req, res) => {
  try {
    const { text, model } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid input text." });
    }
    const selectedModel = model || "svm";
    if (selectedModel === "gemini") {
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured.",
          fallback: true,
          message: "The Gemini model is selected, but the GEMINI_API_KEY was not found in the environment. Please configure it in your Secrets, or switch to the Linear SVM or Logistic Regression models which run entirely locally on high-precision heuristics."
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
              type: import_genai.Type.OBJECT,
              properties: {
                segments: {
                  type: import_genai.Type.ARRAY,
                  items: {
                    type: import_genai.Type.OBJECT,
                    properties: {
                      text: { type: import_genai.Type.STRING },
                      isNoise: { type: import_genai.Type.BOOLEAN },
                      score: { type: import_genai.Type.NUMBER },
                      reason: { type: import_genai.Type.STRING }
                    },
                    required: ["text", "isNoise", "score"]
                  }
                },
                cleanedText: { type: import_genai.Type.STRING }
              },
              required: ["segments", "cleanedText"]
            }
          }
        });
        const resultJson = response.text ? JSON.parse(response.text.trim()) : null;
        if (resultJson && Array.isArray(resultJson.segments)) {
          const formattedSegments = resultJson.segments.map((s, index) => ({
            id: `seg_${index + 1}`,
            text: s.text || "",
            isNoise: !!s.isNoise,
            score: typeof s.score === "number" ? s.score : 0.9,
            type: s.isNoise ? "noise" : "signal",
            reason: s.reason || (s.isNoise ? "Boilerplate content" : "Primary content")
          }));
          const totalSegments = formattedSegments.length;
          const noiseRemoved = formattedSegments.filter((s) => s.isNoise).length;
          const contentRetained = totalSegments - noiseRemoved;
          const cleaningRatio = totalSegments > 0 ? noiseRemoved / totalSegments * 100 : 0;
          return res.json({
            segments: formattedSegments,
            cleanedText: resultJson.cleanedText || "",
            metrics: {
              totalSegments,
              noiseRemoved,
              contentRetained,
              cleaningRatio: parseFloat(cleaningRatio.toFixed(1))
            }
          });
        } else {
          throw new Error("Invalid output format from Gemini model");
        }
      } catch (geminiError) {
        console.error("Gemini classification failed, falling back:", geminiError);
        const fallbackResult = classifyHeuristically(text, "svm");
        return res.json({
          ...fallbackResult,
          warning: "Gemini model failed, automatically fell back to high-precision Linear SVM model.",
          debugInfo: geminiError.message
        });
      }
    }
    try {
      const pythonUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";
      const pythonResponse = await fetch(`${pythonUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model: selectedModel })
      });
      if (!pythonResponse.ok) {
        throw new Error(`Python API responded with status: ${pythonResponse.status}`);
      }
      const result = await pythonResponse.json();
      return res.json(result);
    } catch (pythonError) {
      console.error("Python ML API failed, falling back to heuristic:", pythonError);
      const fallbackResult = classifyHeuristically(text, selectedModel);
      return res.json({
        ...fallbackResult,
        warning: "Python ML API failed or is not running, automatically fell back to heuristic model.",
        debugInfo: pythonError.message
      });
    }
  } catch (err) {
    console.error("Pipeline processing error:", err);
    return res.status(500).json({ error: "Internal server pipeline error." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
