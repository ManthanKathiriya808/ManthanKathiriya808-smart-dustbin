import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';

export default function GraphSection({ fill_level, gas, temperature, humidity }) {
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    setGraphData((prev) => [
      ...prev.slice(-9),
      {
        time: new Date().toLocaleTimeString(),
        fill: fill_level,
        gas,
        temp: temperature,
        hum: humidity,
      },
    ]);
  }, [fill_level, gas, temperature, humidity]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card p-4 hover:scale-[1.01] transition-transform">
      <h2 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-300">📊 Live Sensor Trends</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={graphData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="fill" stroke="#22c55e" strokeWidth={2} name="Bin Fill" />
          <Line type="monotone" dataKey="gas" stroke="#f97316" strokeWidth={2} name="Gas ppm" />
          <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} name="Temp °C" />
          <Line type="monotone" dataKey="hum" stroke="#3b82f6" strokeWidth={2} name="Humidity %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
