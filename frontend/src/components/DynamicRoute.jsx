import React from 'react';

const DynamicRoute = ({ dynamicRoute }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card p-4 col-span-1 md:col-span-2">
      <h2 className="text-xl font-bold text-blue-500 mb-2">🛤️ Dynamic Collection Route</h2>
      <ul className="list-disc list-inside">
        {dynamicRoute.length === 0 ? (
          <li>No bins to collect.</li>
        ) : (
          dynamicRoute.map((bin, i) => (
            <li key={i} className="mb-2">
              <p className="text-sm font-semibold">📍 {bin.place} ({bin.location})</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">🕒 {bin.timestamp}</p>
              <p className="text-xs">
                🔋 Fill: <span className="font-bold">{bin.fill_level}%</span> | 
                💨 Gas: <span className="font-bold">{bin.gas} ppm</span> | 
                🌡️ Temp: <span className="font-bold">{bin.temperature}°C</span>
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default DynamicRoute;