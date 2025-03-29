import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
export default function Navbar({ points }) {
  const [isDark, setIsDark] = useState(false);
  const [priorityCount, setPriorityCount] = useState(0);

  useEffect(() => {
    const darkPref = localStorage.getItem('theme') === 'dark';
    if (darkPref) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://127.0.0.1:5000/stats')
        .then(res => res.json())
        .then(data => setPriorityCount(data.priority_bin_count || 0));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const clearPriority = () => {
    fetch('http://127.0.0.1:5000/clear-priority', { method: 'POST' });
    alert('Priority queue cleared!');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-gray-900 dark:to-gray-700 text-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        
        <Link to="/" className="text-2xl font-bold">🚮 Smart Waste Dashboard</Link>
       
        {priorityCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            {priorityCount} Priority!
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={clearPriority}
          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
        >
          Clear Priority
        </button>
      <Link to="/citizen-dashboard" className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600">
        🏙️ Citizen Dashboard
      </Link>
      <p>⭐ Points: {points}</p>
        <button
          onClick={toggleTheme}
          className="btn btn-sm bg-white text-indigo-600 dark:bg-gray-800 dark:text-white font-semibold rounded shadow hover:bg-indigo-100 dark:hover:bg-gray-700"
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </nav>
  );
}
