import { GoogleGenAI, Type } from "@google/genai";

/**
 * BACKEND MODULE: Gemini AI Controller (Netlify Serverless Function)
 * Refactored for extreme speed and reliability.
 */

const careerRecommendationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      careerName: { type: Type.STRING },
      matchPercentage: { type: Type.NUMBER },
      eligibilityStatus: { type: Type.STRING, enum: ['Eligible', 'Not Eligible'] },
      riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
      shortDescription: { type: Type.STRING },
      whyItMatches: { type: Type.STRING },
      parentalAdvice: { type: Type.STRING },
    },
    required: ['careerName', 'matchPercentage', 'eligibilityStatus', 'riskLevel', 'shortDescription', 'whyItMatches', 'parentalAdvice'],
  },
};

const careerDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    whyThisCareerSuitsYou: { type: Type.STRING },
    careerRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
    scopeAndGrowth: { type: Type.STRING },
  },
  required: ['whyThisCareerSuitsYou', 'careerRoadmap', 'scopeAndGrowth'],
};

// Execution timeout guard (Netlify limit is usually 10s)
const AI_TIMEOUT = 8000; 

export const handler = async (event: any) => {
  console.log("[Gemini Function] Received request:", event.body?.substring(0, 100));

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { action, userData, careerName } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Function to run AI with a timeout
    const runAI = async (model: string, contents: string, config: any) => {
      const aiPromise = ai.models.generateContent({ model, contents, config });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI generation timed out")), AI_TIMEOUT)
      );
      return Promise.race([aiPromise, timeoutPromise]) as Promise<any>;
    };

    if (action === "recommendations") {
      const prompt = `Student Profile:
Stream: ${userData.academics.stream}
Marks: ${userData.academics.marks}%
Skills: ${Object.entries(userData.skills).filter(([_,v]) => v).map(([k]) => k).join(', ')}
Interests: ${userData.interests.primary}
Location: ${userData.location.state}

Task: Recommend 3-5 career paths available to this student. 
Return strictly valid JSON according to schema. 
Focus on realistic Indian context paths.`;

      const response = await runAI("gemini-3-flash-preview", prompt, {
        systemInstruction: "You are an expert Indian Career Coach. Be precise and encouraging.",
        responseMimeType: "application/json",
        responseSchema: careerRecommendationSchema,
      });

      console.log("[Gemini Function] Recommendations generated successfully.");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: response.text,
      };

    } else if (action === "details") {
      const prompt = `Career Path: ${careerName}
User Profile: Marks ${userData.academics.marks}%, Stream ${userData.academics.stream}, Primary Interest ${userData.interests.primary}.
Location: ${userData.location.state}.

Task: Provide personalized reasoning why this suits them, a 5-step roadmap, and future growth perspective.
Do NOT include college or scholarship names - those are handled elsewhere. 
Strictly valid JSON.`;

      const response = await runAI("gemini-3-flash-preview", prompt, {
        responseMimeType: 'application/json',
        responseSchema: careerDetailsSchema,
      });

      console.log("[Gemini Function] Personalized details generated successfully.");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: response.text,
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: "Invalid Action" }) };

  } catch (error: any) {
    console.error("[Gemini Function] Error:", error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Failed to process AI request" }),
    };
  }
};