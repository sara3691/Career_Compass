
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserData, CareerRecommendation, CareerDetails } from '../types';

/**
 * FRONTEND MODULE: AI Career Guidance Service
 * Refactored for dynamic, safe generation of educational data.
 */

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      careerName: { type: Type.STRING },
      matchPercentage: { type: Type.NUMBER },
      eligibilityStatus: { type: Type.STRING, description: "Must be 'Eligible' or 'Not Eligible'" },
      riskLevel: { type: Type.STRING, description: "Must be 'Low', 'Medium', or 'High'" },
      shortDescription: { type: Type.STRING },
      whyItMatches: { type: Type.STRING },
      parentalAdvice: { type: Type.STRING },
    },
    required: ['careerName', 'matchPercentage', 'eligibilityStatus', 'riskLevel', 'shortDescription', 'whyItMatches', 'parentalAdvice'],
  },
};

const detailsSchema = {
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
          name: { type: Type.STRING, description: "Name of a reputable institution for this course." },
          location: { type: Type.STRING, description: "City or Region." },
          type: { type: Type.STRING, description: "e.g., Public, Private, or Deemed." },
          reasoning: { type: Type.STRING, description: "Why this is a popular choice for this course." }
        },
        required: ['name', 'location', 'type', 'reasoning']
      }
    },
    suggestedScholarships: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the scholarship scheme." },
          provider: { type: Type.STRING, description: "e.g., Central Government, State Govt, or Private Trust." },
          typicalEligibility: { type: Type.STRING, description: "Brief overview of common criteria like income or marks." }
        },
        required: ['name', 'provider', 'typicalEligibility']
      }
    }
  },
  required: ['whyThisCareerSuitsYou', 'careerRoadmap', 'scopeAndGrowth', 'suggestedColleges', 'suggestedScholarships'],
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI service timed out after ${ms/1000}s`)), ms)
    )
  ]);
};

export async function getCareerRecommendations(userData: UserData): Promise<CareerRecommendation[]> {
  const prompt = `Student Profile:
- Stream: ${userData.academics.stream}
- Marks: ${userData.academics.marks}%
- Skills: ${Object.entries(userData.skills).filter(([_,v]) => v).map(([k]) => k).join(', ')}
- Interests: ${userData.interests.primary}
- Location: ${userData.location.state}

Task: Recommend 3-5 realistic career paths. 
Return strictly valid JSON matching the schema.`;

  try {
    const response = await withTimeout<GenerateContentResponse>(
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional Indian Career Coach. Use precise yet encouraging language. Focus on realistic academic paths for 12th standard students.",
          responseMimeType: "application/json",
          responseSchema: recommendationSchema,
        },
      }),
      20000
    );

    const text = response.text;
    if (!text) throw new Error("AI returned empty content");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Career Recommendations AI Error:", error);
    throw new Error(error.message || "Failed to analyze profile.");
  }
}

export async function getCareerDetails(careerName: string, userData: UserData): Promise<CareerDetails> {
  const prompt = `Provide a detailed career analysis for: ${careerName}
Context: Student with ${userData.academics.marks}% in ${userData.academics.stream}.
Preferred State: ${userData.location.state}.

Instructions:
1. Generate 3-4 suggested colleges (reputable options in their state or pan-India). Use cautious language like "popularly recommended".
2. Generate 2-3 common scholarship schemes (Govt/Private). Describe typical eligibility patterns, not hard promises.
3. Provide a personalized roadmap and scope.
4. DO NOT assume access to any static database; generate based on your broad training.
5. Return strictly valid JSON.`;

  try {
    const response = await withTimeout<GenerateContentResponse>(
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a backend-focused AI architect specializing in education. You prioritize accuracy and safety over exactness. Avoid fabricating rankings.",
          responseMimeType: 'application/json',
          responseSchema: detailsSchema,
        },
      }),
      15000
    );

    const text = response.text;
    if (!text) throw new Error("AI returned empty details");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Career Details AI Error:", error);
    throw new Error("Details currently unavailable.");
  }
}
