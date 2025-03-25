import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import binIcon from '../assets/dustbin.png';
import gasIcon from '../assets/gas.png';
import tempIcon from '../assets/temperature.png';
import humidityIcon from '../assets/humidity.png';

export default function StatusCard({ fill_level, gas, temperature, humidity }) {
  const getColor = (value, low, mid, high) => {
    if (value < mid) return '#4ade80'; // green
    if (value < high) return '#facc15'; // yellow
    return '#ef4444'; // red
  };

  return (
    <motion.div
      className="rounded-xl shadow-card p-6 bg-white dark:bg-gray-900 space-y-4 hover:scale-[1.01] transition-transform duration-300 ease-in-out"
      whileHover={{ scale: 1.02 }}
    >
      <div className="grid grid-cols-2 gap-4">
        <SensorProgress icon={binIcon} value={fill_level} label="Bin Fill" color={getColor(fill_level, 50, 80, 100)} unit="%" />
        <SensorProgress icon={gasIcon} value={gas > 1000 ? 100 : (gas / 1000) * 100} label="Gas" color={getColor(gas, 300, 600, 1000)} unit="ppm" displayValue={gas} />
        <SensorProgress icon={tempIcon} value={(temperature / 50) * 100} label="Temp" color={getColor(temperature, 25, 35, 50)} unit="°C" displayValue={temperature} />
        <SensorProgress icon={humidityIcon} value={humidity} label="Humidity" color={getColor(humidity, 50, 70, 100)} unit="%" />
      </div>
    </motion.div>
  );
}

function SensorProgress({ icon, value, label, color, unit, displayValue }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <img src={icon} alt={label} className="w-12 h-12" />
      <div className="w-20 animate-pulseSlow">
        <CircularProgressbar
          value={value}
          text={`${displayValue ?? Math.round(value)}${unit}`}
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: '#e5e7eb',
          })}
        />
      </div>
      <p className="font-semibold text-sm">{label}</p>
    </div>
  );
}
