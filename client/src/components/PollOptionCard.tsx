import React from 'react';
import type { PollOption } from '../types/poll.types';

interface PollOptionCardProps {
  option: PollOption;
  totalVotes: number;
  isSelected: boolean;
  hasVoted: boolean;
  onSelect: (optionId: number) => void;
}

export const PollOptionCard: React.FC<PollOptionCardProps> = ({
  option,
  totalVotes,
  isSelected,
  hasVoted,
  onSelect,
}) => {
  const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;

  return (
    <button
      onClick={() => onSelect(option.id)}
      disabled={hasVoted}
      className={`group w-full text-left p-5 rounded-xl border-2 transition-all duration-300 transform ${
        isSelected
          ? 'border-fuchsia-500 bg-gradient-to-br from-purple-900/80 to-blue-900/80 shadow-xl shadow-purple-500/30 scale-[1.02]'
          : 'border-slate-700 hover:border-purple-500 hover:bg-gradient-to-br hover:from-slate-800/80 hover:to-purple-900/50 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.01]'
      } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse shadow-lg shadow-fuchsia-500/50">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <span className="font-semibold text-white group-hover:text-purple-100">{option.text}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-lg">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Vote count bar with gradient animation */}
      <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 transition-all duration-700 ease-out rounded-full shadow-lg shadow-purple-500/50"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
      
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        <span className="font-medium">{option.voteCount} {option.voteCount === 1 ? 'vote' : 'votes'}</span>
      </div>
    </button>
  );
};
