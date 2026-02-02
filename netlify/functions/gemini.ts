import { GoogleGenAI, Type } from "@google/genai";

/**
 * BACKEND MODULE: Gemini AI Controller (Netlify Serverless Function)
 * This function handles all AI reasoning on the server.
 * It uses the Google GenAI SDK with the secure environment variable.
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
    courses: { 
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          duration: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['name', 'duration', 'description'],
      }
    },
    entranceExams: { type: Type.ARRAY, items: { type: Type.STRING } },
    colleges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING },
          courseOffered: { type: Type.STRING },
          fees: { type: Type.STRING },
          eligibility: { type: Type.STRING },
        },
        required: ['name', 'location', 'courseOffered', 'fees', 'eligibility'],
      }
    },
    scholarships: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          provider: { type: Type.STRING },
          eligibility: { type: Type.STRING },
          amount: { type: Type.STRING },
        },
        required: ['name', 'provider', 'eligibility', 'amount'],
      }
    },
    careerRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
    scopeAndGrowth: { type: Type.STRING },
  },
  required: ['whyThisCareerSuitsYou', 'courses', 'entranceExams', 'colleges', 'scholarships', 'careerRoadmap', 'scopeAndGrowth'],
};

export const handler = async (event: any) => {
  // CORS and Method safety
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { action, userData, careerName } = JSON.parse(event.body);
    
    // Use the secure environment variable directly in the server environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    if (action === "recommendations") {
      const systemInstruction = `You are a professional Indian Career Counselor. 
Strictly follow Indian academic eligibility:
- Science (PCM): Engineering, B.Sc Maths/Physics.
- Science (PCB): MBBS, BDS, Nursing, B.Sc Biology.
- Commerce: CA, CS, B.Com, MBA.
- Arts: Law, Design, Humanities.
- Marks < 35%: Not eligible for degrees, suggest Vocational Skills.
Respond only in valid JSON.`;

      const prompt = `Analyze this profile:
Stream: ${userData.academics.stream}
Marks: ${userData.academics.marks}%
Skills: ${Object.entries(userData.skills).filter(([_,v]) => v).map(([k]) => k).join(', ')}
Interests: ${userData.interests.primary}
Location: ${userData.location.state}

Recommend 3-5 career paths.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: careerRecommendationSchema,
        },
      });

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: response.text,
      };

    } else if (action === "details") {
      const prompt = `Detailed roadmap for: "${careerName}" for an Indian student in ${userData.location.state}.
Include real exams (JEE, NEET, CUET), real colleges, and scholarships.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: careerDetailsSchema,
        },
      });

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: response.text,
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: "Invalid Action Provided" }) };

  } catch (error: any) {
    console.error("Backend Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Internal server error during AI processing" }),
    };
  }
};