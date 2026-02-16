import React from 'react';

interface VoteOptionProps {
  option: {
    text: string;
    voteCount: number;
  };
  index: number;
  totalVotes: number;
  hasVoted: boolean;
  onVote: (index: number) => void;
}

export default function VoteOption({ option, index, totalVotes, hasVoted, onVote }: VoteOptionProps) {
  const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;

  return (
    <div className="relative">
      <button
        onClick={() => onVote(index)}
        disabled={hasVoted}
        className="w-full text-left px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition disabled:cursor-not-allowed disabled:opacity-70 relative overflow-hidden group"
      >
        {/* Animated percentage bar */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />

        {/* Content */}
        <div className="relative z-10 flex justify-between items-center">
          <span className="font-semibold text-gray-800 dark:text-white">
            {option.text}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {option.voteCount} votes
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-bold min-w-[60px] text-right">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
