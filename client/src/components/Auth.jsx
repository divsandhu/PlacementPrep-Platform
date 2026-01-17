import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get('view') || 'login';
  const [view, setView] = useState(viewParam);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuth = async (type) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (type === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          throw new Error(error.message || error.toString());
        }
        setMessage('Logged in successfully!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else if (type === 'signup') {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          throw new Error(error.message || error.toString());
        }
        setMessage('Account created! Please check your email for confirmation.');
      } else if (type === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          throw new Error(error.message || error.toString());
        }
        setMessage('Password reset email sent! Check your inbox.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {view === 'login' ? 'Sign in to your account' : view === 'signup' ? 'Create your account' : 'Reset your password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {view === 'login' && "Don't have an account? "}
            {view === 'signup' && 'Already have an account? '}
            {view === 'reset' && 'Enter your email to receive a password reset link'}
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={(e) => { e.preventDefault(); handleAuth(view); }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            {view === 'signup' && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Choose a username"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            {view !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : view === 'login' ? 'Sign in' : view === 'signup' ? 'Sign up' : 'Send Reset Email'}
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm">
            {view !== 'login' && (
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); setMessage(''); }}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </button>
            )}
            {view !== 'signup' && (
              <button
                type="button"
                onClick={() => { setView('signup'); setError(''); setMessage(''); }}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </button>
            )}
            {view !== 'reset' && (
              <button
                type="button"
                onClick={() => { setView('reset'); setError(''); setMessage(''); }}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
