import { UserData, CareerRecommendation, CareerDetails } from '../types';

/**
 * FRONTEND MODULE: Career Guidance API Wrapper
 * All AI logic has been moved to secure Netlify Functions.
 * This file strictly handles the communication between the UI and the backend.
 */

export async function getCareerRecommendations(userData: UserData): Promise<CareerRecommendation[]> {
  try {
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recommendations', userData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Communication error with AI service' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Frontend Service Error (Recommendations):", error);
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
      const errorData = await response.json().catch(() => ({ error: 'Communication error with AI service' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Frontend Service Error (Details):", error);
    throw error;
  }
}
