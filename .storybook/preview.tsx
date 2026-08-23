import type { Preview } from '@storybook/react-vite';

import '../src/index.css';

const preview: Preview = {
  initialGlobals: {
    backgrounds: { value: 'canvas' },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    backgrounds: {
      default: 'canvas',
      options: {
        canvas: { name: 'canvas', value: '#dddddd' },
        'surface-page': { name: 'surface-page', value: '#f5f7fc' },
        'surface-card': { name: 'surface-card', value: '#ffffff' },
        'surface-pressed': { name: 'surface-pressed', value: '#ebf0fa' },
        dark: { name: 'dark', value: '#1f2229' },
      },
    },
  },
};

export default preview;
