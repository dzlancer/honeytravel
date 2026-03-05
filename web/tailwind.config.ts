import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ─── Primary: Mediterranean Sapphire ────────────────────────────
           Deep, warm blue inspired by the Mediterranean Sea off the
           Algerian coast — trustworthy, premium, distinctive. */
        primary: {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#bbdcfc',
          300: '#8ec5f9',
          400: '#58a8f4',
          500: '#2f8be7',
          600: '#1c6cb4',
          700: '#1a5994',
          800: '#1a4a7a',
          900: '#1b3e65',
          950: '#122843',
        },
        /* ─── Accent: Sahara Gold ────────────────────────────────────────
           Warm golden amber inspired by the sand dunes of the Sahara,
           the sunset over Tassili N'Ajjer — luxury, warmth, adventure. */
        accent: {
          50:  '#fffbeb',
          100: '#fff3c4',
          200: '#ffe484',
          300: '#ffd03b',
          400: '#ffbe11',
          500: '#f9a504',
          600: '#dd7e02',
          700: '#b85a06',
          800: '#95440c',
          900: '#7b390e',
          950: '#471c04',
        },
        /* ─── Terracotta: Casbah Warmth ──────────────────────────────────
           Earthy red-clay inspired by Casbah architecture, Berber pottery,
           M'zab Valley — warmth, authenticity, cultural depth. */
        terracotta: {
          50:  '#fef3ee',
          100: '#fce3d6',
          200: '#f8c3ac',
          300: '#f39a78',
          400: '#ec6941',
          500: '#e84921',
          600: '#d93117',
          700: '#b42315',
          800: '#901f18',
          900: '#751d17',
          950: '#400b09',
        },
        /* ─── Success: Olive Green (Algerian flag) ───────────────────── */
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        /* ─── Warm Neutrals (sandy undertone) ────────────────────────── */
        sand: {
          50:  '#fafaf7',
          100: '#f5f5f0',
          200: '#e8e8e0',
          300: '#d4d4c8',
          400: '#a8a89a',
          500: '#737368',
          600: '#545448',
          700: '#3d3d32',
          800: '#262620',
          900: '#171714',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['var(--font-cairo)', 'Tajawal', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(0,0,0,0.08)',
        'soft': '0 4px 16px -4px rgba(0,0,0,0.1)',
        'soft-lg': '0 8px 32px -8px rgba(0,0,0,0.12)',
        'soft-xl': '0 16px 48px -12px rgba(0,0,0,0.15)',
        'glow-primary': '0 0 24px -4px rgba(28,108,180,0.35)',
        'glow-accent': '0 0 24px -4px rgba(249,165,4,0.35)',
        'inner-soft': 'inset 0 2px 4px -1px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-algerian': 'linear-gradient(135deg, #122843 0%, #1c6cb4 50%, #1a5994 100%)',
        'gradient-sahara': 'linear-gradient(135deg, #f9a504 0%, #ffd03b 50%, #ffe484 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #e84921 0%, #f9a504 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
