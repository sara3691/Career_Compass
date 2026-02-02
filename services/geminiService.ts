import { UserData, CareerRecommendation, CareerDetails } from '../types';

/**
 * FRONTEND MODULE: Career Guidance API Wrapper
 * All AI logic is offloaded to secure Netlify Functions.
 * Implements strict AbortController for reliability.
 */

const REQUEST_TIMEOUT = 11000; // 11 seconds (slightly over backend timeout)

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error("CLIENT_TIMEOUT");
    }
    throw error;
  }
}

export async function getCareerRecommendations(userData: UserData): Promise<CareerRecommendation[]> {
  try {
    const response = await fetchWithTimeout('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recommendations', userData }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI_SERVICE_UNAVAILABLE");
    }

    return data;
  } catch (error: any) {
    console.error("Gemini Service Error (Recommendations):", error.message);
    throw error; 
  }
}

export async function getCareerDetails(careerName: string, userData: UserData): Promise<CareerDetails> {
  try {
    const response = await fetchWithTimeout('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'details', careerName, userData }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI_DETAILS_ERROR");
    }

    return data;
  } catch (error: any) {
    console.error("Gemini Service Error (Details):", error.message);
    throw error;
  }
}