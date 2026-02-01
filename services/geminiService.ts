import { GoogleGenAI, Type } from "@google/genai";
import { UserData, CareerRecommendation, CareerDetails } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const systemInstruction = `You are a world-class career counselor for students who have just completed their +2 education in India. Your primary goal is to provide ACCURATE and REALISTIC career recommendations. You must follow these rules strictly:
1.  **Hard Eligibility Filter**: A career is ONLY shown if the student is academically eligible. This is non-negotiable.
    -   Science Stream (PCM/PCMB) is required for Engineering.
    -   Science Stream (PCB/PCMB) is required for Medical (MBBS, etc.).
    -   Commerce stream is required for careers like Chartered Accountancy.
    -   Arts stream is required for careers in humanities, fine arts etc.
    -   A student who failed (+2 marks < 35%) is NOT ELIGIBLE for any degree courses. Suggest diploma or vocational training instead.
2.  **Interest Match**: The recommended career must align with the student's stated interests. Do not suggest careers outside their interest domain.
3.  **Dynamic Generation**: Do not use a fixed list. Generate 3 to 5 diverse recommendations based on the user's complete profile.
4.  **Skills Influence Ranking**: Use the student's skills to rank the recommendations and to formulate the 'whyItMatches' explanation. Skills do NOT override academic eligibility.
5.  **Location is for Details**: Do not filter careers based on location, but keep it in mind for later when generating colleges.
6.  **AI Role**: Your role is to EXPLAIN and RECOMMEND based on rules, not to make decisions. Never override the academic eligibility rules.`;

  const prompt = `
    Analyze the following student profile and generate 3 to 5 career recommendations in JSON format.

    **Student Profile:**
    - **Academics**:
      - Board: ${userData.academics.board}
      - Stream: ${userData.academics.stream}
      - Group/Subjects: ${userData.academics.subjects.join(', ')}
      - Marks: ${userData.academics.marks}%
      - Pass/Fail Status: ${userData.academics.passed ? 'Pass' : 'Fail'}
    - **Skills**: ${Object.entries(userData.skills).filter(([, v]) => v).map(([k]) => k).join(', ') || 'None selected'}
    - **Interests**:
      - Primary: ${userData.interests.primary}
      - Other: ${userData.interests.other}
    - **Location Preference**:
      - State: ${userData.location.state}
      - Districts: ${userData.location.districts.join(', ') || 'N/A'}
      - Anywhere in India: ${userData.location.anywhereInIndia}
      - Abroad: ${userData.location.abroad}

    Based on the system instructions and this profile, generate the JSON output. Ensure 'eligibilityStatus' is 'Not Eligible' if the academic rules are not met for a potential career path.
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
    
    const jsonString = response.text;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to generate recommendations from AI service.");
  }
}

export async function getCareerDetails(careerName: string, userData: UserData): Promise<CareerDetails> {
    const prompt = `
    The user is interested in the career: "${careerName}".
    Based on their full profile below, generate detailed information for this career.
    
    **Student Profile:**
    // Fix: Corrected typo from 'acadademics' to 'academics'.
    - Academics: Stream - ${userData.academics.stream}, Subjects - ${userData.academics.subjects.join(', ')}, Marks - ${userData.academics.marks}%
    - Skills: ${Object.entries(userData.skills).filter(([, v]) => v).map(([k]) => k).join(', ') || 'None selected'}
    - Location Preference: State - ${userData.location.state}, Districts - ${userData.location.districts.join(', ')}, Anywhere in India - ${userData.location.anywhereInIndia}, Abroad - ${userData.location.abroad}

    **Generation Instructions:**
    1.  **Courses**: Generate realistic degree/diploma courses for "${careerName}" that fit the student's academic background.
    2.  **Colleges**: Recommend 3-4 real colleges. **Crucially, these colleges MUST be in the user's preferred location (Districts > State > Anywhere in India)**. If 'Abroad' is selected, suggest colleges in popular countries for that field. If no colleges are found in the specific district, broaden the search to the state. Mention this in an alert.
    3.  **Scholarships**: Suggest relevant scholarships based on course, location, and marks. Mention general government and private scholarships.
    4.  **Roadmap**: Provide a step-by-step career roadmap.
    5.  **Why it Suits You**: Personalize this section, connecting the career to the student's specific skills and interests.

    Generate the output in the specified JSON format.
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

        const jsonString = response.text;
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Gemini API call for details failed:', error);
        throw new Error('Failed to fetch career details from AI service.');
    }
}