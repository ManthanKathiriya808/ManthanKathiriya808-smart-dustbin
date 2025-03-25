import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Navbar from './components/Navbar';
import MapSection from './components/MapSection';
import StatusCard from './components/StatusCard';
import GraphSection from './components/GraphSection';
import AlertBox from './components/AlertBox';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HistoricalDataChart from './components/HistoricalDataChart'; // New Component

export default function App() {
  const [data, setData] = useState(null);
  const [priorityBins, setPriorityBins] = useState([]);
  const [stats, setStats] = useState(null);
  const [showPriority, setShowPriority] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    const socket = io('http://127.0.0.1:5000', { transports: ['polling'], upgrade: false });
    socket.on('connect', () => console.log('✅ Connected!'));
    socket.on('bin_data', (incomingData) => setData(incomingData));
    socket.on('historical_data', (newData) => setHistoricalData(prevData => [...prevData, newData]));

    const interval = setInterval(() => {
      fetch('http://127.0.0.1:5000/priority-bins').then(res => res.json()).then(setPriorityBins);
      fetch('http://127.0.0.1:5000/stats').then(res => res.json()).then(setStats);
      fetch('http://127.0.0.1:5000/historical-data').then(res => res.json()).then(setHistoricalData);
    }, 5000);

    return () => { socket.disconnect(); clearInterval(interval); };
  }, []);

  const reportOverflow = () => {
    fetch('http://127.0.0.1:5000/citizen-report', { method: 'POST' })
      .then(() => {
        toast.success("🚩 Overflow reported & added to Priority Bins!");
        // Force refresh priority bins immediately
        fetch('http://127.0.0.1:5000/priority-bins')
          .then(res => res.json())
          .then(setPriorityBins);
      });
  };

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <h1 className="text-xl font-bold animate-pulse">🔄 Loading Dashboard...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        <MapSection location={data.location} />
        <StatusCard {...data} />
        <GraphSection {...data} />
        <AlertBox priorityBins={priorityBins} />
        <HistoricalDataChart historicalData={historicalData} /> {/* New Component */}
        
        {/* Stats */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card p-4 col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
              🚛 Priority Bins ({priorityBins.length})
              <button onClick={() => setShowPriority(!showPriority)} className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                {showPriority ? 'Hide' : 'Show'}
              </button>
            </h2>
            <button
              onClick={() => {
                fetch('http://127.0.0.1:5000/clear-priority', { method: 'POST' })
                  .then(() => {
                    setPriorityBins([]);
                    toast.info("✅ Priority bins cleared!");
                  });
              }}
              className="px-2 py-1 rounded bg-yellow-500 text-white text-sm hover:bg-yellow-600"
            >
              Clear All
            </button>
          </div>

          {showPriority && (
            <div className="space-y-2 transition-all duration-300 ease-in-out">
              {priorityBins.length === 0 ? (
                <p className="text-sm">No urgent bins yet!</p>
              ) : (
                priorityBins.map((bin, i) => (
                  <div key={i} className="p-3 rounded-lg border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30">
                    <p className="text-sm font-semibold">📍 {bin.place} ({bin.location})</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">🕒 {bin.timestamp}</p>
                    <p className="text-xs">
                      🔋 Fill: <span className="font-bold">{bin.fill_level}%</span> | 
                      💨 Gas: <span className="font-bold">{bin.gas} ppm</span> | 
                      🌡️ Temp: <span className="font-bold">{bin.temperature}°C</span>
                    </p>
                    {bin.place === "Reported Location" && (
                      <span className="inline-block mt-1 text-xs text-yellow-600 font-bold">🧍 Citizen Report</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Impact Stats */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card p-4 col-span-1 md:col-span-2 mt-4">
          <h2 className="text-xl font-bold text-green-600 mb-2">🌍 Environmental Impact</h2>
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-100 dark:bg-green-800/20 p-3 rounded-lg">
                <p>🚚 <span className="font-bold">{stats.mileage_saved_km} km</span> mileage saved!</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-800/20 p-3 rounded-lg">
                <p>🌱 <span className="font-bold">{stats.co2_saved_kg} kg</span> CO2 reduced!</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-700/20 p-3 rounded-lg">
                <p>📣 Citizen Reports: <span className="font-bold">{stats.citizen_reports}</span></p>
              </div>
            </div>
          )}
          <button
            onClick={reportOverflow}
            className="mt-4 px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            🚩 Report Bin Overflow
          </button>
        </div>

      </div>
      <ToastContainer />
    </div>
  );
}