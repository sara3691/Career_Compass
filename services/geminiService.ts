import { GoogleGenAI, Type } from "@google/genai";
import { UserData, CareerRecommendation, CareerDetails } from '../types';

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
        parentalAdvice: { type: Type.STRING, description: "Advice for parents about this career, focusing on safety, cost, job stability, and growth, in simple, non-technical language." },
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
  // Always create a new instance inside the function to ensure the correct API key is picked up from process.env.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `You are a world-class career counselor for Indian students after +2. 
Rules:
1. Hard Eligibility Filter: Science (PCM/B) for Engineering/Medical, Commerce for Finance, Arts for Humanities.
2. If failed (<35%), suggest only vocational training.
3. Align with student interests and skills.
4. Output must be strictly JSON.`;

  const prompt = `
    Analyze this student profile and generate 3 to 5 career recommendations in JSON.
    Board: ${userData.academics.board}
    Stream: ${userData.academics.stream}
    Subjects: ${userData.academics.subjects.join(', ')}
    Marks: ${userData.academics.marks}%
    Status: ${userData.academics.passed ? 'Pass' : 'Fail'}
    Skills: ${Object.entries(userData.skills).filter(([, v]) => v).map(([k]) => k).join(', ')}
    Interests: ${userData.interests.primary}
    State: ${userData.location.state}
  `;

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
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function getCareerDetails(careerName: string, userData: UserData): Promise<CareerDetails> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
    Provide detailed roadmap and info for: "${careerName}".
    Context: Stream ${userData.academics.stream}, Marks ${userData.academics.marks}%, Location ${userData.location.state}.
    Suggest real Indian colleges and exams.
    `;

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
    } catch (error) {
        console.error('Gemini Details API Error:', error);
        throw error;
    }
}