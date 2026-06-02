/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          100: '#f4f4f5',
          950: '#09090b',
        },
        lime: {
          400: '#a3e635',
        }
      }
    },
  },
  plugins: [],
}
