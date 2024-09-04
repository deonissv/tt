/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        fhd: '1920px',
        qhd: '2500px',
      },
      colors: {
        blue: '#0156FF',
        red: '#FF4D4F',
        'light-blue': '#E6F0FF',
        green: '#70C05B',
        'medium-gray': '#666666',
      },
    },
  },
  plugins: [],
};
