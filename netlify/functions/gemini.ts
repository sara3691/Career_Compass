
import { GoogleGenAI, Type } from "@google/genai";

/**
 * BACKEND MODULE: Gemini AI Controller (Netlify Serverless Function)
 * Acting as a Backend-Focused AI Architect.
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

// Netlify synchronous functions have a hard 10s limit. 
// We set AI timeout to 8s to allow for serialization and return.
const AI_TIMEOUT_MS = 8000; 

export const handler = async (event: any) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] AI Request: ${event.httpMethod}`);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // CRITICAL: Mandatory environment variable use.
  // Netlify uses process.env.API_KEY injected from Site Settings.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error(`[${requestId}] Config Error: API_KEY missing in Netlify environment variables.`);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "API_KEY missing. Please configure it in Netlify Site Settings." }) 
    };
  }

  try {
    const { action, userData, careerName } = JSON.parse(event.body || "{}");
    const ai = new GoogleGenAI({ apiKey });

    const runAI = async (modelName: string, prompt: string, schema: any) => {
      console.log(`[${requestId}] Running Model: ${modelName}`);
      
      // Use gemini-3-flash-preview as the production-ready stable model for these tasks
      const aiPromise = ai.models.generateContent({ 
        model: modelName, 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.4,
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI_TIMEOUT")), AI_TIMEOUT_MS)
      );

      return await Promise.race([aiPromise, timeoutPromise]) as any;
    };

    if (action === "recommendations") {
      const prompt = `Act as an expert Indian Career Counselor. 
      Student Profile: Stream ${userData.academics.stream}, Marks ${userData.academics.marks}%, Interest ${userData.interests.primary}.
      Suggest 3-5 realistic career paths in India. You MUST include REAL career names and specific parental advice. 
      Return strictly valid JSON only.`;

      const response = await runAI("gemini-3-flash-preview", prompt, careerRecommendationSchema);
      
      // Robust text extraction to prevent stuck "processing" state
      const text = response.text ?? response.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error("No content returned from Gemini AI.");
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: text,
      };

    } else if (action === "details") {
      const prompt = `Detailed roadmap for career: ${careerName}. Context: ${userData.academics.marks}% marks. 
      You MUST include:
      - At least 3 REAL colleges in India with city and type.
      - At least 2 REAL Indian scholarships with provider name.
      Do NOT leave colleges or scholarships empty.
      Return strictly valid JSON only.`;

      const response = await runAI("gemini-3-flash-preview", prompt, careerDetailsSchema);
      const text = response.text ?? response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No content returned from Gemini AI.");
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: text,
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: "Invalid Action" }) };

  } catch (error: any) {
    console.error(`[${requestId}] Fatal Error:`, error.message);
    
    let statusCode = 500;
    let friendlyMessage = "The AI advisor is temporarily unavailable.";

    if (error.message === "AI_TIMEOUT") {
      statusCode = 504;
      friendlyMessage = "AI service timed out. Falling back to local guidance.";
    } else if (error.message.includes("503") || error.message.includes("overloaded")) {
      statusCode = 503;
      friendlyMessage = "AI model is currently overloaded. Falling back to local guidance.";
    }

    return {
      statusCode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: friendlyMessage }),
    };
  } finally {
    console.log(`[${requestId}] Request Handled`);
  }
};
