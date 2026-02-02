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
  // Directly initializing with process.env.API_KEY as per coding guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `You are a world-class career counselor for students who have just completed their +2 education in India. Your primary goal is to provide ACCURATE and REALISTIC career recommendations. You must follow these rules strictly:
1.  **Hard Eligibility Filter**: A career is ONLY shown if the student is academically eligible. 
    -   Science Stream (PCM/PCMB) is required for Engineering.
    -   Science Stream (PCB/PCMB) is required for Medical.
    -   Commerce stream is required for CA/Business.
2.  **Interest Match**: Align with the student's stated interests.
3.  **Dynamic Generation**: Generate 3 to 5 diverse recommendations.
4.  **Skills Influence**: Use skills to rank recommendations and explain 'whyItMatches'.`;

  const prompt = `
    Analyze this profile and generate 3-5 career recommendations in JSON.
    Board: ${userData.academics.board}
    Stream: ${userData.academics.stream}
    Subjects: ${userData.academics.subjects.join(', ')}
    Marks: ${userData.academics.marks}%
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
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

export async function getCareerDetails(careerName: string, userData: UserData): Promise<CareerDetails> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
    Generate detailed info for career: "${careerName}".
    Student Profile: Stream - ${userData.academics.stream}, Subjects - ${userData.academics.subjects.join(', ')}, Marks - ${userData.academics.marks}%
    Location Preference: State - ${userData.location.state}, Anywhere in India - ${userData.location.anywhereInIndia}
    Generate realistically, including actual colleges and entrance exams in India.
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
        console.error('Gemini API call for details failed:', error);
        throw error;
    }
}