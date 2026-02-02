import { GoogleGenAI, Type } from "@google/genai";
import { UserData, CareerRecommendation, CareerDetails } from '../types';

/**
 * MODULE: Intelligence Engine
 * This module handles all structured data generation using Gemini 3 Flash.
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
      parentalAdvice: { type: Type.STRING, description: "Advice for Indian parents focusing on stability and growth." },
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

export async function getCareerRecommendations(userData: UserData): Promise<CareerRecommendation[]> {
  // Initialization using the mandatory process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `You are a professional Indian Career Counselor. 
Strictly follow Indian academic eligibility:
- Science (PCM): Engineering, B.Sc Maths/Physics.
- Science (PCB): MBBS, BDS, Nursing, B.Sc Biology.
- Commerce: CA, CS, B.Com, MBA.
- Arts: Law, Design, Humanities.
- Marks < 35%: Not eligible for degrees, suggest Vocational Skills.
Respond only in valid JSON.`;

  const prompt = `Student Profile:
Stream: ${userData.academics.stream}
Marks: ${userData.academics.marks}%
Skills: ${Object.entries(userData.skills).filter(([_,v]) => v).map(([k]) => k).join(', ')}
Interests: ${userData.interests.primary}
Location: ${userData.location.state}

Provide 3-5 career paths.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: careerRecommendationSchema,
      },
    });
    
    return JSON.parse(response.text || '[]');
  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw error;
  }
}

export async function getCareerDetails(careerName: string, userData: UserData): Promise<CareerDetails> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Detailed analysis for: "${careerName}" for an Indian student in ${userData.location.state}.
Include real exams (JEE, NEET, etc.), real Indian colleges, and specific roadmap steps.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: careerDetailsSchema,
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    console.error('AI Detail Error:', error);
    throw error;
  }
}