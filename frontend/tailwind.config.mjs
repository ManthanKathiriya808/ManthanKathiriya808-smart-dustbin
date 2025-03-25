export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        pulseSlow: 'pulse 3s ease-in-out infinite',
      },
      boxShadow: {
        card: '0 4px 15px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [require('daisyui')],
};
