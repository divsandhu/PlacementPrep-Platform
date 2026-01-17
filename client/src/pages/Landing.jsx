import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const topics = [
  { id: 'aptitude', name: 'Aptitude', icon: '📊', available: true },
  { id: 'dsa', name: 'Data Structures & Algorithms', icon: '🔢', available: true },
  { id: 'os', name: 'Operating Systems', icon: '💻', available: true },
  { id: 'cn', name: 'Computer Networks', icon: '🌐', available: true },
  { id: 'dbms', name: 'Database Management', icon: '🗄️', available: true },
  { id: 'coding', name: 'Coding Problems', icon: '⌨️', available: false },
];

export default function Landing() {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Compete in
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Real-Time Quizzes
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              Test your skills across multiple topics. Challenge friends. Track your progress. 
              Master aptitude, DSA, OS, CN, DBMS, and more.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  Login to Compete
                </Link>
              )}
              <Link
                to="/leaderboard"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">How it Works</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Get started in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up & Login',
                description: 'Create your account or login to start competing. Track your progress and see your rankings.',
                icon: '🔐',
              },
              {
                step: '2',
                title: 'Create or Join Room',
                description: 'Create a quiz room with your chosen topic, or join an existing room using a room code.',
                icon: '🚪',
              },
              {
                step: '3',
                title: 'Compete & Win',
                description: 'Answer questions in real-time, compete with others, and see live leaderboard updates.',
                icon: '🏆',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Available Topics</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Choose from a variety of technical topics</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className={`p-6 rounded-xl border-2 transition-all ${
                  topic.available
                    ? 'bg-white dark:bg-gray-900 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{topic.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{topic.name}</h3>
                    {!topic.available && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Coming Soon</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-indigo-600 dark:bg-indigo-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Competing?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of students and professionals testing their skills in real-time.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
