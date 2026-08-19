/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
      },
      colors: {
        fg: {
          primary: 'var(--color-fg-primary)',
          secondary: 'var(--color-fg-secondary)',
          tertiary: 'var(--color-fg-tertiary)',
          disabled: 'var(--color-fg-disabled)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          brand: 'var(--color-border-brand)',
        },
        bg: {
          DEFAULT: 'var(--color-bg)',
          canvas: 'var(--color-bg-canvas)',
          subtle: 'var(--color-bg-subtle)',
          pressed: 'var(--color-bg-pressed)',
        },
        brand: {
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          light: 'var(--color-brand-light)',
          soft: 'var(--color-brand-soft)',
        },
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        success: 'var(--color-success)',
      },
    },
  },
  plugins: [],
};
