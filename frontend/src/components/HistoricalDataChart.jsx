import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const HistoricalDataChart = ({ historicalData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('historicalChart').getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: historicalData.map((data, index) => index + 1),
        datasets: [
          {
            label: 'Historical Fill Levels (%)',
            data: historicalData.map(data => data.fill_level),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.2
          },
          {
            label: 'Gas Levels (ppm)',
            data: historicalData.map(data => data.gas),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.2
          },
          {
            label: 'Temperature (°C)',
            data: historicalData.map(data => data.temperature),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.2
          },
          {
            label: 'Humidity (%)',
            data: historicalData.map(data => data.humidity),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            fill: true,
            tension: 0.2
          }
        ]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Levels'
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [historicalData]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card p-4 col-span-1 md:col-span-2">
      <h2 className="text-xl font-bold text-blue-500 mb-2">📉 Historical Data Analysis</h2>
      <canvas id="historicalChart"></canvas>
    </div>
  );
};

export default HistoricalDataChart;