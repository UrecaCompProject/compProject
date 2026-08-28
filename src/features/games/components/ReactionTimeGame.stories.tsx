import { Modal } from '@/features/shared';

import ReactionTimeGame from './ReactionTimeGame';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'games/ReactionTimeGame',
  component: ReactionTimeGame,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-surface-card">
        <Story />
        <Modal />
      </div>
    ),
  ],
} satisfies Meta<typeof ReactionTimeGame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Intro: Story = {
  args: {
    initialPhase: 'intro',
  },
};

export const Ready: Story = {
  args: {
    initialPhase: 'ready',
    initialReactionTime: 7500,
  },
};

export const Result: Story = {
  args: {
    initialPhase: 'result',
    initialReactionTime: 10000,
    initialEarnedReward: 5,
  },
};
