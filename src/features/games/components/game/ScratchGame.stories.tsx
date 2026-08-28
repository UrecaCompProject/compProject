import { AIChat } from '@/features/ai-consult';

import ScratchGame from './ScratchGame';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'games/ScratchGame',
  component: ScratchGame,
} satisfies Meta<typeof ScratchGame>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1) 컴포넌트 단독 렌더 - 스크래치 로직만 빠르게 확인할 때
export const Standalone: Story = {
  args: { reward: 3 },
};

// 1-1) reward를 안 넘겼을 때 1~5개 사이에서 랜덤으로 정해지는지 확인
export const RandomReward: Story = {
  args: {},
};

// 2) 실제 배치 미리보기: 이 게임은 GameLayer/BottomSheet로 열리지 않고,
//    AI 채팅(퀵리플라이 클릭) 또는 혜택/미션 목록 클릭 시 모두 "채팅 메시지 영역 안에
//    인라인으로" 나타난다. 실제 ChatMessageList.tsx의 렌더 패턴(recommendations/report/form과
//    동일하게, AIChat 말풍선 "안"이 아니라 그 아래 형제 블록으로 붙는 방식)을 그대로 따라
//    실제 AIChat 컴포넌트 밑에 배치해 미리 확인한다. 채팅 쪽 실제 연동(ChatMessage 타입
//    확장, ChatMessageList.tsx 분기 추가 등)은 담당자가 진행한다.
export const InChatPreview: Story = {
  args: { reward: 2 },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-[360px] flex-col gap-4 bg-surface-page p-4">
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
