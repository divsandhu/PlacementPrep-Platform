import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const isMounted = useRef(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuestions: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    console.log('Dashboard useEffect triggered, user:', user, 'authLoading:', authLoading);
    
    // Wait for auth to finish loading first
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    if (user) {
      console.log('Auth loaded and user exists, fetching dashboard data...');
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboardData = async () => {
    console.log('fetchDashboardData started');
    
    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Dashboard data fetch timeout')), 10000); // 10 second timeout
    });
    
    try {
      // Fetch user stats with error handling for missing tables
      let sessions = [];
      let progressData = [];
      console.log('Starting to fetch dashboard data for user:', user?.id);
      
      try {
        const sessionsPromise = supabase
          .from('quiz_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(10);
        
        const { data: sessionsData, error: sessionsError } = await Promise.race([sessionsPromise, timeoutPromise]);

        if (!sessionsError) {
          sessions = sessionsData || [];
        }
      } catch (err) {
        console.warn('quiz_sessions table not available or timeout:', err.message);
        if (err.message.includes('timeout')) {
          console.log('Dashboard fetch timed out, using empty data');
        }
      }

      try {
        const progressPromise = supabase
          .from('user_progress')
          .select(`
            *,
            quiz_topics:topic_id (name, slug, category_id)
          `)
          .eq('user_id', user.id)
          .order('last_attempted_at', { ascending: false })
          .limit(5);
        
        const { data: progressDataResult, error: progressError } = await Promise.race([progressPromise, timeoutPromise]);

        if (!progressError) {
          progressData = progressDataResult || [];
        }
      } catch (err) {
        console.warn('user_progress table not available or timeout:', err.message);
        if (err.message.includes('timeout')) {
          console.log('Progress fetch timed out, using empty data');
        }
      }

      // Calculate stats
      const totalQuizzes = sessions?.length || 0;
      const totalQuestions = sessions?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0;
      const totalScore = sessions?.reduce((sum, s) => sum + (s.score || 0), 0) || 0;
      const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
      const bestScore = sessions?.length > 0 
        ? Math.max(...sessions.map(s => s.score || 0))
        : 0;

      if (isMounted.current) {
        setStats({
          totalQuizzes,
          averageScore,
          bestScore,
          totalQuestions,
        });

        console.log('Setting dashboard state:', { sessions, progressData });
        setRecentSessions(sessions);
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (isMounted.current) {
        // Set empty data to prevent infinite loading
        setStats({
          totalQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
          totalQuestions: 0,
        });
        setRecentSessions([]);
        setProgress([]);
      }
    } finally {
      console.log('fetchDashboardData completed');
    }
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your dashboard.</p>
          <Link
            to="/auth"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.username || user?.email}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Track your progress and improve your skills</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalQuizzes}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.averageScore}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Best Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.bestScore}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Questions Answered</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalQuestions}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Recent Quiz Sessions</h2>
            <div className="p-6">
              {recentSessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No quiz sessions yet</p>
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Start Your First Quiz
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.started_at ? new Date(session.started_at).toLocaleDateString() : 'Unknown date'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.total_questions} questions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">{session.score} pts</p>
                        <p className="text-sm text-gray-500">
                          {session.correct_answers}/{session.total_questions} correct
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progress by Topic */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Progress by Topic</h2>
            </div>
            <div className="p-6">
              {progress.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No progress data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {progress.map((item) => {
                    const accuracy = item.total_questions > 0
                      ? Math.round((item.total_correct / item.total_questions) * 100)
                      : 0;
                    
                    return (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {item.quiz_topics?.name || 'Unknown Topic'}
                          </p>
                          <p className="text-sm font-bold text-indigo-600">{accuracy}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${accuracy}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>{item.total_attempts} attempts</span>
                          <span>Best: {item.best_score} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/home"
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Create Quiz Room</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Start a new quiz session</p>
            </Link>
            <Link
              to="/leaderboard"
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">View Leaderboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">See top performers</p>
            </Link>
            <Link
              to="/history"
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Quiz History</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View past attempts</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
