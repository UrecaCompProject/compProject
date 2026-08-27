import ReactionTimeGame from './ReactionTimeGame';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'games/ReactionTimeGame',
  component: ReactionTimeGame,
} satisfies Meta<typeof ReactionTimeGame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    reward: 5,
  },
};
