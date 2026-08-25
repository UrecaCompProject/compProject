import ScratchGame from './ScratchGame';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'games/ScratchGame',
  component: ScratchGame,
  parameters: {
    // 채팅 말풍선 안에 인라인으로 놓일 걸 가정해서, 캔버스에 좁은 폭을 줘서 확인
    layout: 'centered',
  },
} satisfies Meta<typeof ScratchGame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standalone: Story = {
  args: { reward: 3 },
};

export const WithConfirmButton: Story = {
  args: {
    reward: 5,
    onClose: () => alert('닫기 클릭됨 (실제로는 채팅 쪽에서 처리)'),
  },
};
