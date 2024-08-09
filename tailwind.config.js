/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        drop: {
          '0%': { transform: 'translateY(-100%)', opacity: 1 },
          '90%': { transform: 'translateY(100vh)', opacity: 1 },
          '100%': { transform: 'translateY(100vh)', opacity: 0 },
        },
      },
      animation: {
        drop: 'drop 3s ease-in-out infinite',
      },
    },
    },
  plugins: [],
}

