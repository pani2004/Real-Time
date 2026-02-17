import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { PollOptionCard } from '../components/PollOptionCard';
import { useSocket } from '../hooks/useSocket';
import { getPoll, submitVote } from '../utils/api';
import { getFingerprint } from '../utils/fingerprint';
import type { Poll } from '../types/poll.types';

export const PollView: React.FC = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  // Fetch poll data
  const fetchPoll = async () => {
    if (!pollId) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching poll:', pollId);
      const data = await getPoll(pollId);
      console.log('Poll data received:', data);
      setPoll(data);
      
      // Check if user has voted before (stored in localStorage)
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
      if (votedPolls[pollId]) {
        setHasVoted(true);
        setSelectedOption(votedPolls[pollId]);
      }
    } catch (err: any) {
      console.error('Error fetching poll:', err);
      if (err.response?.status === 404) {
        setError('Poll not found');
      } else {
        setError(err.message || 'Failed to load poll. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!pollId) return;

    socket.emit('joinPoll', pollId);

    socket.on('pollUpdate', (updatedPoll: Poll) => {
      console.log('Poll updated via socket:', updatedPoll);
      setPoll(updatedPoll);
    });

    return () => {
      socket.emit('leavePoll', pollId);
      socket.off('pollUpdate');
    };
  }, [pollId, socket]);

  const handleVote = async () => {
    if (!pollId || selectedOption === null) return;

    setIsVoting(true);
    setError(null);

    try {
      const fingerprint = getFingerprint();
      const response = await submitVote(pollId, {
        optionId: selectedOption,
        voterFingerprint: fingerprint,
      });

      // Store vote in localStorage
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
      votedPolls[pollId] = selectedOption;
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));

      setHasVoted(true);
      setVoteSuccess(true);
      
      // Update poll data immediately (optimistic update)
      if (response.poll) {
        setPoll(response.poll);
      }

      setTimeout(() => setVoteSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleChangeVote = () => {
    setHasVoted(false);
    setVoteSuccess(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card variant="glass" className="max-w-md">
          <LoadingSpinner text="Loading poll..." />
        </Card>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <Card variant="glass" className="max-w-md w-full">
          <div className="text-center space-y-4">
            <ErrorMessage message={error} onRetry={fetchPoll} />
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Create a New Poll
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header with icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-3 drop-shadow-lg">
            {poll.question}
          </h1>
          <div className="inline-flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-purple-500/30">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="font-bold text-white">{poll.totalVotes}</span>
              <span className="text-gray-200 font-medium">{poll.totalVotes === 1 ? 'vote' : 'votes'}</span>
            </div>
            <div className="w-px h-5 bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-gray-200 font-medium">Live</span>
            </div>
          </div>
        </div>

        <Card variant="glass">
          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} onRetry={() => setError(null)} />
            </div>
          )}

          {voteSuccess && (
            <div className="mb-6 bg-gradient-to-r from-emerald-900/80 to-green-900/80 border-2 border-emerald-500 rounded-xl p-5 animate-scale-in shadow-xl">
              <div className="flex items-center text-emerald-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mr-3 shadow-lg shadow-emerald-500/50">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg text-white">Vote Recorded! ✅</p>
                  <p className="text-sm text-emerald-200">Your vote has been successfully submitted</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-8">
            {poll.options.map((option) => (
              <PollOptionCard
                key={option.id}
                option={option}
                totalVotes={poll.totalVotes}
                isSelected={selectedOption === option.id}
                hasVoted={hasVoted}
                onSelect={setSelectedOption}
              />
            ))}
          </div>

          {!hasVoted ? (
            <Button
              onClick={handleVote}
              disabled={selectedOption === null}
              isLoading={isVoting}
              variant="primary"
              size="lg"
              className="w-full text-lg py-4"
            >
              {selectedOption === null ? '👆 Select an option to vote' : '🗳️ Submit Your Vote'}
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleChangeVote}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                🔄 Change Vote
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                ➕ Create New Poll
              </Button>
            </div>
          )}
        </Card>

        {/* Enhanced live indicator */}
        <div className="mt-6 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-purple-500/30">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-ping absolute" />
              <div className="w-3 h-3 bg-green-400 rounded-full relative shadow-lg shadow-green-400/50" />
            </div>
            <span className="text-white font-semibold">Results updating in real-time</span>
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" />
              <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse animation-delay-150 shadow-lg shadow-blue-400/50" />
              <div className="w-1 h-4 bg-pink-400 rounded-full animate-pulse animation-delay-300 shadow-lg shadow-pink-400/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
