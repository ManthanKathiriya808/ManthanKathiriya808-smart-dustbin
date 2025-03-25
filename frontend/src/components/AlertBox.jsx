import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AlertBox() {
  const [priorityBins, setPriorityBins] = useState([]);

  useEffect(() => {
    const fetchPriority = () => {
      fetch('http://127.0.0.1:5000/priority-bins')
        .then(res => res.json())
        .then(data => setPriorityBins(data));
    };
    fetchPriority();
    const interval = setInterval(fetchPriority, 5000);
    return () => clearInterval(interval);
  }, []);

  if (priorityBins.length === 0) return null;

  return (
    <motion.div
      className="bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-xl shadow-lg p-4 col-span-1 md:col-span-2 space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-lg font-bold mb-2">⚠️ Priority Bins ({priorityBins.length})</h2>
      {priorityBins.map((bin, index) => (
        <div key={index} className="p-2 rounded bg-red-600/80 mb-2">
          <p>📍 <strong>{bin.place} </strong></p>
          <p>🌍 {bin.location}</p>
          <p>🕒 {bin.timestamp}</p>
          <p>🗑️ Fill: {bin.fill_level}% | 🔥 Gas: {bin.gas} ppm</p>
          <p>🌡️ Temp: {bin.temperature}°C | 💧 Humidity: {bin.humidity}%</p>
        </div>
      ))}
    </motion.div>
  );
}
