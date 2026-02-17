export interface PollOption {
  id: number;
  text: string;
  order: number;
  voteCount: number;
}

export interface Poll {
  id: string;
  question: string;
  createdAt: string;
  options: PollOption[];
  totalVotes: number;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
}

export interface VoteRequest {
  optionId: number;
  voterFingerprint: string;
}

export interface VoteResponse {
  success: boolean;
  updated: boolean;
  poll: Poll;
}
