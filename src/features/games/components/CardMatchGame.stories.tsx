import { useState } from 'react';

import { BottomSheet, Button } from '@/features/shared';

import { useActiveGameMeta } from '../hooks/useActiveGameMeta';
import { useGameStore } from '../store/useGameStore';

import CardMatchGame from './CardMatchGame';
import GameLayer from './GameLayer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'games/CardMatchGame',
  component: CardMatchGame,
} satisfies Meta<typeof CardMatchGame>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1) 컴포넌트 단독 렌더 - 바텀시트/스토어 없이 게임 로직·상태만 빠르게 확인할 때
export const Standalone: Story = {
  args: { reward: 5 },
};

// 2) 실제 서비스와 동일한 구조 (BottomSheet + GameLayer + useGameStore)로 확인
// -> "미션 시작" 버튼 클릭 -> 0.5초 후 z-index 크로스페이드로 게임이 드러나고
//    헤더 타이틀/뒤로가기도 같은 타이밍에 바뀌는 걸 볼 수 있음
export const InMissionSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const openGame = useGameStore((state) => state.openGame);
    const activeGame = useActiveGameMeta();

    return (
      <>
        <Button onClick={() => setOpen(true)}>혜택/이벤트 시트 열기</Button>

        <BottomSheet
          open={open}
          onOpenChange={setOpen}
          title={activeGame ? activeGame.title : '게임 혜택'}
          onBack={activeGame?.onBack}
          size="full"
          bodyClassName="px-0"
        >
          <GameLayer>
            <div className="p-5">
              <Button onClick={() => openGame('card-match', { reward: 5 })}>
                카드 뒤집기 시작
              </Button>
            </div>
          </GameLayer>
        </BottomSheet>
      </>
    );
  },
};
