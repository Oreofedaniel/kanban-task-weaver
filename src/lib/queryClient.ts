import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_PATH = '/api';

const getApiUrl = (endpoint: string) => {
  return `${API_URL}${API_BASE_PATH}${endpoint}`;
};

export async function apiRequest(method: string, endpoint: string, data?: any) {
  const token = localStorage.getItem('token');
  const url = getApiUrl(endpoint);
  
  try {
    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      data,
    });
    return response;
  } catch (error: any) {
    console.error(`API Request failed for ${url}:`, error);
    
    if (error.response?.status === 404) {
      console.warn(`Endpoint ${endpoint} not found`);
      throw new Error(`API endpoint not found: ${endpoint}`);
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - backend may be down');
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
}