import axios from 'axios';

// Mock API base URL - replace with actual backend URL later
const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  postSensorData: async (data) => {
    // return apiClient.post('/sensor-data', data);
    console.log('Mock post sensor data:', data);
    return Promise.resolve({ data: { success: true } });
  },
  postAnalyze: async (data) => {
    return apiClient.post('/analyze', data);
  },
  getBatch: async (id) => {
    // return apiClient.get(`/batch/${id}`);
    console.log('Mock get batch:', id);
    return Promise.resolve({ data: { id, status: 'Verified' } });
  },
  getAlerts: async () => {
    // return apiClient.get('/alerts');
    console.log('Mock get alerts');
    return Promise.resolve({ data: [] });
  }
};

export default apiClient;
