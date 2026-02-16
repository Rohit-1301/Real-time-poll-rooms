import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { saveToken, saveUser } from '../utils/auth';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);

      if (response.data.success) {
        saveToken(response.data.data.token);
        saveUser(response.data.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          Log In
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          Welcome back! Sign in to your account
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg mb-4"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>

          <p className="text-center text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
