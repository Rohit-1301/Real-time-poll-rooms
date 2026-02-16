import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PollCreation from './components/PollCreation';
import PollRoom from './components/PollRoom';
import Signup from './components/Signup';
import Login from './components/Login';
import { isAuthenticated, getUser, removeToken } from './utils/auth';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-6 right-6 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-110"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {/* Auth Navigation */}
        <div className="fixed top-6 left-6 z-50 flex gap-3">
          {user ? (
            <>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <span className="text-gray-800 dark:text-white font-semibold">
                  👋 {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition text-gray-800 dark:text-white font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition text-gray-800 dark:text-white font-semibold"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition text-white font-semibold"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <Routes>
          <Route path="/" element={<PollCreation />} />
          <Route path="/poll/:id" element={<PollRoom />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
