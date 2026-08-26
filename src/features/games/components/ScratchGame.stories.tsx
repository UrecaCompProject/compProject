import { AIChat } from '@/features/ai-consult';

import ScratchGame from './ScratchGame';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'games/ScratchGame',
  component: ScratchGame,
} satisfies Meta<typeof ScratchGame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standalone: Story = {
  args: { reward: 1 },
};

export const InChatPreview: Story = {
  args: { reward: 1 },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4 p-4 mx-auto w-90 bg-surface-page">
        <div>
          <AIChat sentence={'오늘의 스크래치 이벤트에 참여해보세요!'} />
          <div className="mt-3">
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
};
