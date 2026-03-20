import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    primary: '#00ff88',
                    danger: '#ff3333',
                    'text-primary': '#ccffdd',
                    'text-secondary': '#88ccaa',
                    'bg-primary': '#000a04',
                    'bg-secondary': '#001408',
                    'bg-tertiary': '#001a0a',
                    'border-dark': '#004422',
                    'bg-interactive': '#001105',
                },
            },
            boxShadow: {
                'cyber-glow': '0 0 20px rgba(0,255,136,0.04), inset 0 0 40px rgba(0,255,136,0.02)',
                'cyber-glow-hover': '0 0 35px rgba(0,255,136,0.1), inset 0 0 40px rgba(0,255,136,0.03)',
                'cyber-glow-sm': '0 0 10px rgba(0,255,136,0.2)',
                'cyber-danger-glow': '0 0 10px rgba(255,51,51,0.15)',
            },
        },
    },
    plugins: [],
};

export default config;
