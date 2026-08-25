/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        macBg: '#D6E2E4',
        macMist: '#E8EFF1',
        brandTeal: '#2A9D8F',
        brandTealDark: '#21867A',
        brandTealLight: '#E8F5F3',
        brandPrimary: '#4F46E5',
        brandIndigo: '#6366F1',
        brandSlate: '#0F172A',
      },
    },
  },
  plugins: [],
};
