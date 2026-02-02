
import { GoogleGenAI, Type } from "@google/genai";

/**
 * BACKEND MODULE: Gemini AI Controller
 * Adheres to strict @google/genai SDK guidelines.
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
    suggestedColleges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING },
          type: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        },
        required: ['name', 'location', 'type', 'reasoning']
      }
    },
    suggestedScholarships: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          provider: { type: Type.STRING },
          typicalEligibility: { type: Type.STRING }
        },
        required: ['name', 'provider', 'typicalEligibility']
      }
    }
  },
  required: ['whyThisCareerSuitsYou', 'careerRoadmap', 'scopeAndGrowth', 'suggestedColleges', 'suggestedScholarships'],
};

// Netlify synchronous limit is 10s.
const AI_TIMEOUT_MS = 8500; 

export const handler = async (event: any) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Request Received`);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Mandatory: process.env.API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error(`[${requestId}] Config Error: API_KEY missing`);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "API Key not configured in environment." }) 
    };
  }

  try {
    const { action, userData, careerName } = JSON.parse(event.body || "{}");
    const ai = new GoogleGenAI({ apiKey });

    const runAI = async (modelName: string, prompt: string, schema: any) => {
      console.log(`[${requestId}] Calling model: ${modelName}`);
      const aiPromise = ai.models.generateContent({ 
        model: modelName, 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7,
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI_TIMEOUT")), AI_TIMEOUT_MS)
      );

      return await Promise.race([aiPromise, timeoutPromise]) as any;
    };

    if (action === "recommendations") {
      const prompt = `Act as an expert Indian Career Counselor. 
      Student Profile: ${userData.academics.stream} stream, ${userData.academics.marks}% marks. Interest: ${userData.interests.primary}.
      Suggest 3-5 career paths. Output ONLY JSON matching the provided schema.`;

      const response = await runAI("gemini-3-flash-preview", prompt, careerRecommendationSchema);
      
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: response.text || "[]",
      };

    } else if (action === "details") {
      const prompt = `Detailed roadmap for ${careerName}. Context: ${userData.academics.marks}% in ${userData.academics.stream}. India location.`;

      const response = await runAI("gemini-3-flash-preview", prompt, careerDetailsSchema);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: response.text || "{}",
      };
    }

    return { statusCode: 400, body: "Invalid Action" };

  } catch (error: any) {
    console.error(`[${requestId}] Error:`, error.message);
    
    let statusCode = 500;
    let errorMessage = "The AI advisor is temporarily unavailable.";

    if (error.message === "AI_TIMEOUT") {
      statusCode = 504;
      errorMessage = "AI processing timed out. Switching to local database.";
    } else if (error.message.includes("503") || error.message.includes("overloaded")) {
      statusCode = 503;
      errorMessage = "AI service is currently overloaded. Using local database fallback.";
    }

    return {
      statusCode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: errorMessage }),
    };
  } finally {
    console.log(`[${requestId}] Request Finalized`);
  }
};
