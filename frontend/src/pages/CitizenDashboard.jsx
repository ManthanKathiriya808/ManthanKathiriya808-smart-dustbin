import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CitizenDashboard = ({ initialUsername }) => {
    const [citizenBins, setCitizenBins] = useState([]);
    const [showCitizenBins, setShowCitizenBins] = useState(true);
    const [points, setPoints] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [username, setUsername] = useState(initialUsername || "");

    useEffect(() => {
        if (!username) return;

        const fetchUserPoints = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/user-score?username=${username}`);
                const data = await res.json();
                setPoints(data.points || 0);
            } catch (err) {
                console.error("⚠️ Error Fetching User Score:", err);
            }
        };

        fetchUserPoints();
    }, [username]);

    useEffect(() => {
        const fetchCitizenBins = async () => {
            try {
                const res = await fetch("http://127.0.0.1:5000/priority-bins");
                const bins = await res.json();
                const reportedBins = bins.filter((bin) => bin.place === "Reported Location");
                setCitizenBins(reportedBins);
            } catch (err) {
                console.error("⚠️ Citizen Bins Fetch Error:", err);
            }
        };

        fetchCitizenBins();
        const interval = setInterval(fetchCitizenBins, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/leaderboard");
            const data = await res.json();
            setLeaderboard(data);
            const userEntry = data.find((user) => user.username === username);
            setUserRank(userEntry ? data.indexOf(userEntry) + 1 : "Unranked");
        } catch (err) {
            console.error("⚠️ Leaderboard Fetch Error:", err);
        }
    };

    useEffect(() => {
        if (!username) return;
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 5000);
        return () => clearInterval(interval);
    }, [username]);

    const reportOverflow = async () => {
        if (!username) {
            toast.error("⚠️ Please enter your name before reporting!");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:5000/citizen-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            const data = await res.json();
            toast.success(`🚩 Overflow reported! 🎉 +10 points! Total: ${data.points}`);

            setPoints(data.points || 0);
            fetchLeaderboard();

            const binsRes = await fetch("http://127.0.0.1:5000/priority-bins");
            const bins = await binsRes.json();
            const reportedBins = bins.filter((bin) => bin.place === "Reported Location");
            setCitizenBins(reportedBins);
        } catch (err) {
            console.error("⚠️ Report Overflow Error:", err);
            toast.error("⚠️ Failed to report bin. Try again!");
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
            <h1 className="text-2xl font-bold text-blue-700 dark:text-yellow-400">🏙️ Citizen Dashboard</h1>

            <p className="mt-2 text-lg font-semibold text-green-600 dark:text-green-400">
                🎉 {username}, You are ranked <span className="text-2xl font-bold">{userRank}</span>!
            </p>

            <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
                ⭐ Your Points: <span className="text-2xl font-bold">{points}</span>
            </p>

            <div className="mt-4">
                <label className="block text-lg font-semibold">Enter Your Name:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-2 mt-2 border rounded-lg"
                />
            </div>

            <button
                onClick={reportOverflow}
                className="mt-4 px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
                🚩 Report Bin Overflow
            </button>

            {/* 📢 Reported Bins Section */}
            <div className="mt-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-yellow-600 dark:text-yellow-300">
                        📢 Reported Bins ({citizenBins.length})
                    </h2>
                    <button
                        onClick={() => setShowCitizenBins(!showCitizenBins)}
                        className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                    >
                        {showCitizenBins ? "Hide" : "Show"}
                    </button>
                </div>

                {showCitizenBins && (
                    <div className="mt-4 space-y-3">
                        {citizenBins.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">No citizen-reported bins yet.</p>
                        ) : (
                            citizenBins.map((bin, i) => (
                                <div key={i} className="p-4 border-l-4 rounded-lg shadow-md bg-white dark:bg-gray-800 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-yellow-700 dark:text-yellow-300">📍 {bin.location}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">🕒 {bin.timestamp}</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">👤 Reported by: {bin.username}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${bin.priority === "High" ? "bg-red-500 text-white" : bin.priority === "Medium" ? "bg-yellow-400 text-black" : "bg-green-500 text-white"}`}>
                                        {bin.priority} Priority
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* 🏆 Leaderboard Section */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">🏆 Citizen Leaderboard</h2>
                <table className="w-full mt-3 border-collapse border border-purple-500">
                    <thead>
                        <tr className="bg-purple-500 text-white">
                            <th className="border border-purple-600 px-4 py-2">Rank</th>
                            <th className="border border-purple-600 px-4 py-2">Name</th>
                            <th className="border border-purple-600 px-4 py-2">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-2 text-gray-500">No leaderboard data yet.</td>
                            </tr>
                        ) : (
                            leaderboard.map((user, i) => (
                                <tr key={i} className="bg-white dark:bg-gray-800 border border-purple-500">
                                    <td className="border px-4 py-2">{i + 1}</td>
                                    <td className="border px-4 py-2">{user.username}</td>
                                    <td className="border px-4 py-2">{user.points}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ToastContainer />
        </div>
    );
};

export default CitizenDashboard;
  