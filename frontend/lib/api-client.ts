// API client for connecting to Python backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchStarFromAPI(): Promise<any> {
  try {
    console.log('Fetching star from:', `${API_BASE_URL}/api/stars/generate`);
    
    const response = await fetch(`${API_BASE_URL}/api/stars/generate`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received star data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching star from API:', error);
    throw error;
  }
}

export async function fetchDailyStarFromAPI(): Promise<any> {
  try {
    console.log('Fetching daily star from:', `${API_BASE_URL}/api/stars/daily`);
    
    const response = await fetch(`${API_BASE_URL}/api/stars/daily`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received daily star data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching daily star from API:', error);
    throw error;
  }
}

export async function fetchStarByName(name: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stars/${encodeURIComponent(name)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching star ${name} from API:`, error);
    throw error;
  }
}

export async function listAvailableStars(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stars/list`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error listing stars from API:', error);
    throw error;
  }
}