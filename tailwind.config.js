/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{js,ts,jsx,tsx,html,css}",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'fluid-wave': "url('../assets/fluid-wave-bg.jpg')",
        'fluid-wave-root': "url('./assets/fluid-wave-bg.jpg')",
      },
      colors: {
        pitch: '#081726',
        navy: {
          DEFAULT: '#0f2941',
          surface: '#173652',
          light: '#254a6d',
          dark: '#081726',
          glow: 'rgba(15, 41, 65, 0.45)',
        },
        espresso: {
          DEFAULT: '#0f2941',
          light: '#173652',
          dark: '#081726',
          glow: 'rgba(15, 41, 65, 0.45)',
        },
        steel: {
          DEFAULT: '#46627d',
          light: '#597a9b',
          accent: '#7e95ab',
          glow: 'rgba(70, 98, 125, 0.35)',
        },
        bronze: {
          DEFAULT: '#46627d',
          light: '#597a9b',
          accent: '#7e95ab',
          glow: 'rgba(70, 98, 125, 0.35)',
        },
        ecru: {
          DEFAULT: '#e8ecf0',
          light: '#f4f6f8',
          surface: '#ffffff',
          border: '#b6c6d5',
          dark: '#9db2c4',
        },
        // Harmonious aliases
        cream: {
          DEFAULT: '#e8ecf0',
          light: '#f4f6f8',
          dark: '#b6c6d5',
          border: '#b6c6d5',
        },
        terracotta: {
          DEFAULT: '#46627d',
          dark: '#0f2941',
          light: '#e8ecf0',
        },
        ocean: {
          DEFAULT: '#46627d',
          dark: '#0f2941',
          light: '#e8ecf0',
        },
        obsidian: '#0f2941',
        porcelain: '#e8ecf0',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif']
      },
      boxShadow: {
        'pill': '0 10px 30px -10px rgba(8, 23, 38, 0.18), 0 2px 8px -2px rgba(15, 41, 65, 0.08), 0 14px 28px -12px rgba(70, 98, 125, 0.25)',
        'steel': '0 4px 14px rgba(70, 98, 125, 0.25), 0 8px 24px -6px rgba(70, 98, 125, 0.4)',
        'bronze': '0 4px 14px rgba(70, 98, 125, 0.25), 0 8px 24px -6px rgba(70, 98, 125, 0.4)',
        'navy': '0 4px 14px rgba(15, 41, 65, 0.35), 0 10px 25px -8px rgba(15, 41, 65, 0.5)',
        'espresso': '0 4px 14px rgba(15, 41, 65, 0.35), 0 10px 25px -8px rgba(15, 41, 65, 0.5)',
        'water-card': '0 20px 45px -12px rgba(15, 41, 65, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03), 0 12px 30px -8px rgba(70, 98, 125, 0.18)',
      }
    },
  },
  plugins: [],
}
