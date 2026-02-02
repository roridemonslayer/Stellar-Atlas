/**
 * API service for connecting to the Stellar Atlas backend
 * This replaces the local star generation with real NASA data
 */

import type { StarData } from "./star-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Fetch a random star from the NASA backend
 */
export async function fetchRandomStar(): Promise<StarData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stars/generate`, {
      cache: "no-store", // Always get fresh data
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Convert the API response to match our StarData interface
    return {
      ...data,
      generatedAt: new Date(data.generatedAt),
    };
  } catch (error) {
    console.error("Failed to fetch random star from API:", error);
    // Fallback to local generation if API fails
    const { generateStar } = await import("./star-data");
    return generateStar();
  }
}

/**
 * Fetch the daily star from the NASA backend
 * This ensures all users see the same star on the same day
 */
export async function fetchDailyStar(): Promise<StarData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stars/daily`, {
      // Cache for 1 hour since daily star doesn't change often
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      ...data,
      generatedAt: new Date(data.generatedAt),
    };
  } catch (error) {
    console.error("Failed to fetch daily star from API:", error);
    // Fallback to local generation if API fails
    const { generateDailyStar } = await import("./star-data");
    return generateDailyStar();
  }
}

/**
 * Fetch a specific star by name
 */
export async function fetchStarByName(name: string): Promise<StarData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stars/${encodeURIComponent(name)}`, {
      cache: "force-cache", // Cache named stars
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      ...data,
      generatedAt: new Date(data.generatedAt),
    };
  } catch (error) {
    console.error(`Failed to fetch star ${name} from API:`, error);
    throw error;
  }
}

/**
 * List all available stars in the database
 */
export async function fetchAvailableStars(): Promise<Array<{
  name: string;
  type: string;
  distance: number;
  constellation: string;
  hasExoplanets: boolean;
}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stars/list`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.stars;
  } catch (error) {
    console.error("Failed to fetch star list from API:", error);
    return [];
  }
}

/**
 * Check if the API is healthy
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      cache: "no-store",
    });
    return response.ok;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
}