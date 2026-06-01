/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Distinctive display + refined body (loaded in index.html)
        display: ['"Bricolage Grotesque"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Warm editorial palette — cream canvas, ink text, citrus + teal accents
        cream: '#FBF6EC',
        sand: '#F3EADB',
        ink: {
          DEFAULT: '#15123A',
          soft: '#3B375E',
          mute: '#6B6789',
        },
        tangerine: '#FF7A3D',
        coral: '#FF4D6D',
        teal: '#0FB6A6',
        amber: '#F4A521',
        grape: '#7C5CFC',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(21, 18, 58, 0.18)',
        lift: '0 24px 60px -18px rgba(21, 18, 58, 0.28)',
        glow: '0 0 0 1px rgba(255,122,61,0.25), 0 18px 50px -16px rgba(255,77,109,0.45)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px,20px) scale(0.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '80%,100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        riseIn: {
          '0%': { transform: 'translateY(18px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        gradientShift: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        blob: 'blob 18s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        pulseRing: 'pulseRing 1.8s cubic-bezier(0.2,0.6,0.3,1) infinite',
        pop: 'pop 0.45s cubic-bezier(0.2,0.8,0.2,1) both',
        riseIn: 'riseIn 0.6s cubic-bezier(0.2,0.8,0.2,1) both',
        gradientShift: 'gradientShift 6s ease infinite',
      },
    },
  },
  plugins: [],
}
