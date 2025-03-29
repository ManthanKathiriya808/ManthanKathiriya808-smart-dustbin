import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/leaderboard");
        const data = await res.json();
        setLeaders(data);
      } catch (err) {
        console.error("⚠️ Leaderboard Fetch Error:", err);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Refresh leaderboard every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">🏆 Leaderboard</h2>
      <ul className="mt-3 space-y-2">
        {leaders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No reports yet.</p>
        ) : (
          leaders.map((user, i) => (
            <li key={i} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {i + 1}. {user.username} - ⭐ {user.points} points
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
