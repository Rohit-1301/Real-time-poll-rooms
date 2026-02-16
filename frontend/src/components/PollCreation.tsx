import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function PollCreation() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState<number | null>(null); // Duration in minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!question.trim()) {
      setError('Please enter a poll question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/polls`, {
        question: question.trim(),
        options: validOptions,
        duration: duration // Add duration (null for no time limit)
      }, {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        navigate(`/poll/${response.data.data._id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          Create a Poll
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          Ask a question and get instant feedback
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Poll Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's your question?"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              maxLength={500}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Options
            </label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                  maxLength={200}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-purple-500 hover:text-purple-500 transition"
            >
              + Add Option
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Poll Duration (Optional)
            </label>
            <select
              value={duration || ''}
              onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            >
              <option value="">No time limit</option>
              <option value="1">1 minute (quick test)</option>
              <option value="5">5 minutes (testing)</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="360">6 hours</option>
              <option value="1440">24 hours</option>
              <option value="10080">7 days</option>
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {duration 
                ? `Results will be hidden until the poll closes in ${duration >= 1440 ? `${Math.floor(duration / 1440)} day(s)` : duration >= 60 ? `${Math.floor(duration / 60)} hour(s)` : `${duration} minute(s)`}` 
                : 'Results will be visible immediately'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {loading ? 'Creating Poll...' : 'Create Poll'}
          </button>
        </form>
      </div>
    </div>
  );
}
