/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f5f7ff',
                    100: '#ebf0fe',
                    200: '#ced9fd',
                    300: '#a1b5fa',
                    400: '#708cf6',
                    500: '#4f46e5',
                    600: '#4338ca',
                    700: '#3730a3',
                    800: '#2e2984',
                    900: '#2a276d',
                    950: '#19173d',
                },
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
                'gradient-flow': 'gradient-flow 8s ease infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shake: {
                    '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                    '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                    '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                    '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
                },
                'gradient-flow': {
                    '0%, 100%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                },
            },
        },
    },
    plugins: [],
};
