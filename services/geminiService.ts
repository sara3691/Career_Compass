import { UserData, CareerRecommendation, CareerDetails } from '../types';

/**
 * FRONTEND MODULE: Secure API Gateway
 * This service no longer uses the Gemini SDK directly in the browser.
 * It calls a Netlify serverless function which holds the API Key securely on the server side.
 * This prevents "API_KEY undefined" errors in the browser and protects your credentials.
 */

export async function getCareerRecommendations(userData: UserData): Promise<CareerRecommendation[]> {
  try {
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recommendations', userData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch recommendations from server');
    }

    return await response.json();
  } catch (error: any) {
    console.error("Frontend Gateway Error:", error);
    throw error;
  }
}

export async function getCareerDetails(careerName: string, userData: UserData): Promise<CareerDetails> {
  try {
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'details', careerName, userData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch career details from server');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Frontend Detail Gateway Error:', error);
    throw error;
  }
}