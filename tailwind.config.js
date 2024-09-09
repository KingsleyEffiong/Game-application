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
          '90%': { transform: 'translateY(190px)', opacity: 1 },
          '100%': { transform: 'translateY(190px)', opacity: 0 },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.5)' },
          '100%': { transform: 'scale(1)' },  // Removed the semicolon
        }
      },
      animation: {
        drop: 'drop 3s ease-in-out infinite',
        spinSlow: 'spinSlow 3s linear infinite',
        scaleUp: 'scaleUp 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
