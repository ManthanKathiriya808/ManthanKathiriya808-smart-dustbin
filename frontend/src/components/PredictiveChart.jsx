import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const PredictiveChart = ({ predictedFill }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('predictiveChart').getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: predictedFill.length }, (_, i) => i + 1),
        datasets: [
          {
            label: 'Predicted Fill Level (%)',
            data: predictedFill,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.2
          }
        ]
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [predictedFill]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card p-4 col-span-1 md:col-span-2">
      <h2 className="text-xl font-bold text-red-500 mb-2">📈 Predicted Fill Levels</h2>
      <canvas id="predictiveChart"></canvas>
    </div>
  );
};

export default PredictiveChart;