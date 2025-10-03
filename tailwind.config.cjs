/**
 * TailwindCSS 配置（CommonJS 版本，兼容性更好）
 */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          900: '#0b1220',
          800: '#0e1a2b'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.45), 0 0 40px rgba(56,189,248,0.15)'
      },
      backgroundImage: {
        'pitch-grid': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
        'pitch-gradient': 'linear-gradient(180deg, #020617 0%, #0b1220 40%, #0e1a2b 100%)'
      },
      backgroundSize: {
        'grid-sm': '22px 22px'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}

