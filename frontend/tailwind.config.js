
/** @type {import('tailwindcss').Config} */
export default {  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A1628', // Deep Navy (Background)
          800: '#1E293B', // Dark Slate (Cards)
          700: '#334155',
        },
        electric: {
          500: '#0EA5E9', // Electric Blue (Accents)
          600: '#0284C7',
        },
        warm: {
          50: '#FAFAF9', // Warm White (Text)
          100: '#F5F5F4',
          200: '#E7E5E4',
        },
        slate: {
          400: '#94A3B8',
          500: '#64748B', // Secondary Text
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
