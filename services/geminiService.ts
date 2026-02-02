import { GoogleGenAI, Type } from "@google/genai";
import { UserData, CareerRecommendation, CareerDetails } from '../types';

/**
 * MODULE 2: Intelligence Service
 * Handles all AI interactions with strict schema enforcement.
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
        parentalAdvice: { type: Type.STRING, description: "Advice for parents focusing on job stability, cost, and safety." },
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
  // Use process.env.API_KEY directly as required. 
  // Note: For client-side apps, ensure your build tool defines this.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `You are an elite Indian career counselor for students after 12th grade.
STRICT RULES:
1. Eligibility: Only Science students can do Engineering/MBBS. Commerce students for CA/Finance.
2. If marks < 35%, student is 'Not Eligible' for degree courses; suggest vocational/diploma.
3. Use the student's listed skills to calculate 'matchPercentage'.
4. Output must be valid JSON matching the provided schema.`;

  const prompt = `Analyze this profile:
Stream: ${userData.academics.stream}
Subjects: ${userData.academics.subjects.join(', ')}
Marks: ${userData.academics.marks}%
Skills: ${Object.entries(userData.skills).filter(([_,v]) => v).map(([k]) => k).join(', ')}
Interests: ${userData.interests.primary}
State: ${userData.location.state}

Recommend 3-5 career paths.`;

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
    console.error("Gemini AI API Error:", error);
    // Re-throwing so the UI can catch and display a helpful message.
    throw new Error(error.message || "Failed to fetch recommendations");
  }
}

export async function getCareerDetails(careerName: string, userData: UserData): Promise<CareerDetails> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Provide deep-dive details for the career: "${careerName}".
Student Context: ${userData.academics.stream} stream, based in ${userData.location.state}.
Include real Indian colleges, exams (like JEE, NEET, CUET), and scholarships.
Personalize "whyThisCareerSuitsYou" using their skills: ${Object.entries(userData.skills).filter(([_,v]) => v).map(([k]) => k).join(', ')}.`;

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
        console.error('Gemini Details API Error:', error);
        throw new Error(error.message || "Failed to fetch career details");
    }
}