import { useState } from 'react';

import { Button, Modal } from '@/shared';

import RewardSheet from './RewardSheet';

import type { Meta, StoryObj } from '@storybook/react-vite';

const mockGame = {
  GameLayer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  isGameId: (id: string): id is 'card-match' | 'reaction' | 'attendance' =>
    ['card-match', 'reaction', 'attendance'].includes(id),
  activeGameMeta: null,
  openGame: () => {},
  closeGame: () => {},
};

const meta = {
  title: 'reward/RewardSheet',
  component: RewardSheet,
  args: {
    open: true,
    onOpenChange: () => undefined,
    game: mockGame,
  },
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'surface-page',
    },
  },
} satisfies Meta<typeof RewardSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <main className="min-h-screen bg-surface-page p-5">
        <Button onClick={() => setOpen(true)}>혜택/이벤트 열기</Button>

        <RewardSheet game={mockGame} open={open} onOpenChange={setOpen} />
        <Modal />
      </main>
    );
  },
};
