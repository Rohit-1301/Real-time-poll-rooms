import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../utils/socket';
import { getVoterToken } from '../utils/voterToken';
import { getAuthHeader } from '../utils/auth';
import VoteOption from './VoteOption';
import Toast from './Toast';
import CountdownTimer from './CountdownTimer';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

interface PollOption {
  text: string;
  voteCount: number;
}

interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  endsAt?: string;
  isActive?: boolean;
}

export default function PollRoom() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPoll();
    
    // Connect socket
    socket.connect();
    
    // Join poll room
    if (id) {
      socket.emit('join-poll', id);
    }

    // Listen for vote updates
    socket.on('vote-update', (updatedPoll: Poll) => {
      setPoll(updatedPoll);
    });

    return () => {
      if (id) {
        socket.emit('leave-poll', id);
      }
      socket.off('vote-update');
      socket.disconnect();
    };
  }, [id]);

  const fetchPoll = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/polls/${id}`);
      if (response.data.success) {
        setPoll(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Poll not found');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (hasVoted) return;

    const voterToken = getVoterToken();

    try {
      const response = await axios.post(`${API_URL}/api/votes`, {
        pollId: id,
        optionIndex,
        voterToken
      }, {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        setPoll(response.data.data);
        setHasVoted(true);
        showToast('Vote submitted successfully!', 'success');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to submit vote';
      showToast(errorMsg, 'error');
      if (errorMsg.includes('already voted')) {
        setHasVoted(true);
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyShareLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Loading poll...</div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Poll Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-600 transition"
          >
            Create New Poll
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Share Link Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Share this poll</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={window.location.href}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={copyShareLink}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-600 transition"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Poll Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Countdown Timer and Status */}
          {poll.endsAt && (
            <div className="flex justify-center mb-6">
              <CountdownTimer endsAt={poll.endsAt} />
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            {poll.question}
          </h1>

          {/* Show vote count only if poll is closed or has no time limit */}
          {(!poll.endsAt || !poll.isActive) && (
            <div className="mb-6">
              <div className="text-center text-gray-600 dark:text-gray-300 mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {poll.totalVotes}
                </span>
                {' '}total votes
              </div>
            </div>
          )}

          {/* Warning for active time-limited polls */}
          {poll.endsAt && poll.isActive && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-center text-yellow-800 dark:text-yellow-200 font-semibold">
                ⚠️ Results will be revealed when the poll closes
              </p>
            </div>
          )}

          <div className="space-y-4">
            {poll.options.map((option, index) => (
              <VoteOption
                key={index}
                option={option}
                index={index}
                totalVotes={poll.totalVotes}
                hasVoted={hasVoted || Boolean(poll.endsAt && !poll.isActive)} // Disable if voted or poll ended
                onVote={handleVote}
              />
            ))}
          </div>

          {/* Poll ended message */}
          {poll.endsAt && !poll.isActive && (
            <div className="mt-6 text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                🔴 This poll has ended. Voting is no longer allowed.
              </p>
            </div>
          )}

          {hasVoted && poll.isActive && (
            <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
              Thanks for voting! Results update in real-time.
            </div>
          )}
        </div>

        {/* Create New Poll Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-white hover:text-gray-200 transition underline"
          >
            Create your own poll
          </a>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
