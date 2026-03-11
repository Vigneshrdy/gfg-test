/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", "[data-theme='dark']"],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          dim:    'var(--accent-dim)',
          muted:  'var(--accent-muted)',
          base:   'var(--accent-base)',
          bright: 'var(--accent-bright)',
          pop:    'var(--accent-pop)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Dynamic theme tokens — read from CSS variables at runtime */
        bg: {
          void:    'var(--bg-void)',
          base:    'var(--bg-base)',
          raised:  'var(--bg-raised)',
          overlay: 'var(--bg-overlay)',
          sunken:  'var(--bg-sunken)',
        },
        'border-faint':   'var(--border-faint)',
        'border-default': 'var(--border-default)',
        'border-strong':  'var(--border-strong)',
        positive: { DEFAULT: 'var(--positive)', bg: 'var(--positive-bg)' },
        warning:  { DEFAULT: 'var(--warning)',  bg: 'var(--warning-bg)'  },
        negative: { DEFAULT: 'var(--negative)', bg: 'var(--negative-bg)' },
        info:     { DEFAULT: 'var(--info)',     bg: 'var(--info-bg)'     },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-muted)',
          disabled:  'var(--text-disabled)',
          accent:    'var(--text-accent)',
          inverse:   'var(--text-inverse)',
        },
        chart: {
          1: '#2DD4BF',
          2: '#60A5FA',
          3: '#FB7185',
          4: '#FBBF24',
          5: '#A78BFA',
          6: '#86EFAC',
          7: '#94A3B8',
          8: '#FB923C',
        },
      },
      fontFamily: {
        sans:       ["'JetBrains Mono'", "'JetBrains Mono NL'", 'monospace'],
        mono:       ["'JetBrains Mono'", "'JetBrains Mono NL'", 'monospace'],
        display:    ["'JetBrains Mono'", "'JetBrains Mono NL'", 'monospace'],
        jetbrains:  ["'JetBrains Mono'", "'JetBrains Mono NL'", 'monospace'],
      },
      boxShadow: {
        card:   'var(--shadow-card)',
        modal:  'var(--shadow-modal)',
        accent: 'var(--shadow-accent)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(45,212,191,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(45,212,191,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        blobMove: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.3)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        micPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(239,68,68,0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'blob-move': 'blobMove 8s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'slide-down': 'slideDown 0.2s ease-out both',
        'mic-pulse': 'micPulse 1s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
