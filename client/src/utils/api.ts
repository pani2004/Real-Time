import axios from 'axios';
import type { Poll, CreatePollRequest, VoteRequest } from '../types/poll.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_URL,
  fullURL: `${API_URL}/api`
});

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Create a new poll
export const createPoll = async (data: CreatePollRequest): Promise<Poll> => {
  const response = await api.post('/polls', data);
  return response.data;
};

// Get poll by ID
export const getPoll = async (pollId: string): Promise<Poll> => {
  const response = await api.get(`/polls/${pollId}`);
  return response.data;
};

// Submit a vote
export const submitVote = async (pollId: string, data: VoteRequest) => {
  const response = await api.post(`/polls/${pollId}/vote`, data);
  return response.data;
};

export default api;
