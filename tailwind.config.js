/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FFF5E6',
          100: '#FFE6B3',
          200: '#FFD280',
          300: '#FFBE4D',
          400: '#FFAA1A',
          500: '#FF9933',
          600: '#E6751A',
          700: '#CC5500',
          800: '#B34000',
          900: '#992B00',
        },
        emerald: {
          50: '#E8F5E8',
          100: '#C2E6C2',
          200: '#9BD69B',
          300: '#75C775',
          400: '#4EB84E',
          500: '#138808',
          600: '#0F7007',
          700: '#0B5905',
          800: '#084204',
          900: '#042B02',
        },
        navy: {
          50: '#E6E6FF',
          100: '#B3B3FF',
          200: '#8080FF',
          300: '#4D4DFF',
          400: '#1A1AFF',
          500: '#000080',
          600: '#000066',
          700: '#00004D',
          800: '#000033',
          900: '#00001A',
        },
        gold: {
          50: '#FFFDF5',
          100: '#FFF9E6',
          200: '#FFF2CC',
          300: '#FFECB3',
          400: '#FFE599',
          500: '#FFD700',
          600: '#E6C200',
          700: '#CCAD00',
          800: '#B39900',
          900: '#998400',
        },
        terracotta: {
          50: '#FDF2F0',
          100: '#F9DDD6',
          200: '#F5C8BC',
          300: '#F1B3A2',
          400: '#ED9E88',
          500: '#E2725B',
          600: '#D94D2E',
          700: '#B8381E',
          800: '#972F19',
          900: '#762613',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
};