import axios from 'axios';
import type { Poll, CreatePollRequest, VoteRequest } from '../types/poll.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
