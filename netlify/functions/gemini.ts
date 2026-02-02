import { GoogleGenAI, Type } from "@google/genai";

/**
 * BACKEND MODULE: Gemini AI Controller (Netlify Serverless Function)
 * Acting as a Backend-Focused AI Architect.
 * This environment is the only place where the Google GenAI SDK and API keys are used.
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

// Execution timeout guard (Netlify limit is 10s)
const AI_TIMEOUT = 8500; 

export const handler = async (event: any) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Request Received: ${event.httpMethod}`);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  // Check for API Key in environment
  const apiKey = process.env.VITE_API_KEY;
  if (!apiKey) {
    console.error(`[${requestId}] CRITICAL: VITE_API_KEY environment variable is not set.`);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Backend configuration error: API Key missing." }) 
    };
  }

  try {
    const { action, userData, careerName } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey });

    // AI Execution wrapper with timeout
    const runAI = async (model: string, contents: string, config: any) => {
      const aiPromise = ai.models.generateContent({ model, contents, config });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI generation timed out (9s limit reached)")), AI_TIMEOUT)
      );
      return Promise.race([aiPromise, timeoutPromise]) as Promise<any>;
    };

    if (action === "recommendations") {
      console.log(`[${requestId}] Action: recommendations`);
      const prompt = `Student Profile:
- Stream: ${userData.academics.stream}
- Marks: ${userData.academics.marks}%
- Skills: ${Object.entries(userData.skills).filter(([_,v]) => v).map(([k]) => k).join(', ')}
- Interests: ${userData.interests.primary}
- Location: ${userData.location.state}

Task: Recommend 3-5 career paths available to this student in the Indian context. 
Return strictly valid JSON according to schema. 
Ensure eligibility logic is followed (e.g., Medicine requires Science PCB).`;

      const response = await runAI("gemini-3-flash-preview", prompt, {
        systemInstruction: "You are an expert Indian Career Coach. Be realistic, encouraging, and precise. Always check stream eligibility before recommending.",
        responseMimeType: "application/json",
        responseSchema: careerRecommendationSchema,
      });

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: response.text,
      };

    } else if (action === "details") {
      console.log(`[${requestId}] Action: details for ${careerName}`);
      const prompt = `Career Path: ${careerName}
User Context: ${userData.academics.marks}% in ${userData.academics.stream}. 
Target State: ${userData.location.state}.

Task: Act as a Backend-Focused AI Architect.
1. Generate 3-4 suggested colleges as 'recommendations', not guarantees. Focus on State, Course, and Reputation.
2. Generate 2-3 common scholarship schemes. Use cautious language ("commonly available", "merit-based options"). Avoid exact eligibility promises.
3. Provide a roadmap and growth outlook.
4. Add a disclaimer: 'Information is dynamic; verification with official sources is mandatory.'

Output strictly valid JSON.`;

      const response = await runAI("gemini-3-flash-preview", prompt, {
        systemInstruction: "You are a backend-focused AI architect. Avoid fabricating rankings. Use phrases like 'popularly recommended' and 'frequently considered'.",
        responseMimeType: 'application/json',
        responseSchema: careerDetailsSchema,
      });

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: response.text,
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: "Invalid Action" }) };

  } catch (error: any) {
    console.error(`[${requestId}] Function Error:`, error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Failed to process AI request" }),
    };
  }
};
