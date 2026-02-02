
import { UserData, CareerRecommendation, CareerDetails } from '../types';

/**
 * FRONTEND MODULE: Career Guidance API Wrapper
 * All AI logic is offloaded to secure Netlify Functions.
 * Implements a strict timeout to prevent infinite loading states.
 */

const REQUEST_TIMEOUT = 12000; // 12 seconds (slightly longer than Netlify's 10s limit)

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
      throw new Error("TIMEOUT");
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

    if (!response.ok) {
      const errorText = await response.text();
      let msg = "AI_SERVICE_ERROR";
      try {
        const err = JSON.parse(errorText);
        msg = err.error || msg;
      } catch(e) {}
      throw new Error(msg);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Gemini Service Error (Recommendations):", error.message);
    throw error; // Re-throw to be handled by App.tsx fallback logic
  }
}

export async function getCareerDetails(careerName: string, userData: UserData): Promise<CareerDetails> {
  try {
    const response = await fetchWithTimeout('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'details', careerName, userData }),
    });

    if (!response.ok) {
      throw new Error("AI_DETAILS_ERROR");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Gemini Service Error (Details):", error.message);
    throw error;
  }
}
