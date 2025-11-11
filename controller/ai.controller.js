import File_ from "../model/file.model.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

export const getFileInsights = async (req, res) => {
  const fileId = req.params.fileId;

  if (!fileId) {
    return res.status(400).json({
      success: false,
      message: "File ID is required",
    });
  }

  try {
    const file = await File_.findById(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // 🧠 Initialize Gemini Model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🧩 Prepare file content
    let inlinePart = null;
    if (file.fileUrl) {
      const fileResp = await fetch(file.fileUrl);
      const buffer = await fileResp.arrayBuffer();

      inlinePart = {
        inlineData: {
          mimeType: "application/pdf", // dynamically detect if needed
          data: Buffer.from(buffer).toString("base64"),
        },
      };
    }

    // 🧾 Prompt for Gemini
    const prompt = `
You are an intelligent file analysis assistant.
Analyze the given document and provide insights in pure JSON with these fields:
{
  "summary": "A 2–4 sentence summary of the file content",
  "keyPoints": ["Point1", "Point2", "Point3"],
  "topicsCovered": ["Topic1", "Topic2", "Topic3"],
  "possibleUseCases": ["Use Case 1", "Use Case 2"]
}
Respond ONLY with valid JSON — no markdown or commentary.
`;

    // ✅ Proper Gemini request structure
    const contents = [
      {
        parts: [
          { text: prompt },
          inlinePart || { text: JSON.stringify(file) },
        ],
      },
    ];

    // 🧠 Generate content
    const result = await model.generateContent({ contents });

    // Extract text output correctly
    const rawText = result.response.text();

    // ✅ Try parsing JSON safely
    let parsedOutput;
    try {
      parsedOutput = JSON.parse(rawText.trim());
    } catch (e) {
      console.warn("JSON parsing failed, returning raw text instead.");
      parsedOutput = { raw: rawText };
    }

    // 🎯 Return final structured response
    return res.status(200).json({
      success: true,
      data: parsedOutput,
    });
  } catch (err) {
    console.error("Gemini Insights Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate file insights",
      error: err.message,
    });
  }
};
