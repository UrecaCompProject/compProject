import QuizResult from './QuizResult';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'chat-quiz/QuizResult',
  component: QuizResult,
  args: {
    isCorrect: true,
    explanation:
      '서비스마다 서로 다른 비밀번호를 사용하면 계정 피해를 줄일 수 있습니다.',
  },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[358px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuizResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Correct: Story = {};

export const Incorrect: Story = {
  args: {
    isCorrect: false,
    explanation:
      '공용 Wi-Fi에서는 중요한 개인정보 입력을 피하는 것이 안전합니다.',
  },
};
