/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#F8EDFF',   // Lavender
                    100: '#DDF2FD',  // Light blue
                    200: '#C2D9FF',  // Soft blue
                    300: '#BFCFE7',  // Gray-blue
                    400: '#525CEB',  // Medium blue — primary accent
                    500: '#525CEB',  // Primary brand blue
                    600: '#3a44d4',  // Darker brand blue
                    700: '#2a32b0',  // Deep blue
                    800: '#190482',  // Dark navy
                    900: '#120360',  // Deepest navy
                    950: '#0c0240',  // Near-black navy
                },
                surface: {
                    dark: '#3D3B40',   // Charcoal
                },
            },
            fontFamily: {
                sans: ['Poppins', 'Open Sans', 'system-ui', 'sans-serif'],
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
