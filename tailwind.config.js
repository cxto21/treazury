/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/web/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { 
        mono: ['Orbitron', 'monospace'] 
      },
      colors: {
        'cyber-black': '#050505',
        'cyber-gray': '#121212',
        'neon-white': '#FFFFFF',
        'ink-black': '#1a1a1a',
      },
      animation: {
        'hex-open': 'hexOpen 2s ease-out forwards',
        'loading-bar': 'hexLoad 2.5s ease-out forwards',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 0.3s infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
      },
      dropShadow: {
        'neon': '0 0 4px rgba(255, 255, 255, 0.4)',
        'neon-strong': '0 0 8px rgba(255, 255, 255, 0.6)',
        'ink': '0 0 2px rgba(0, 0, 0, 0.3)',
        'ink-strong': '0 0 6px rgba(0, 0, 0, 0.5)',
      },
      boxShadow: {
        'neon': '0 0 8px rgba(255, 255, 255, 0.2)',
        'ink': '0 0 8px rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: [],
}
