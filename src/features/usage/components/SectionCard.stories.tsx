import SectionCard from './SectionCard';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'usage/SectionCard',
  component: SectionCard,
  args: {
    children: (
      <>
        <div className="text-bold-16-140">제목</div>
        <div className="text-regular-12-130 text-fg-tertiary">
          내용 영역입니다.
        </div>
      </>
    ),
  },
} satisfies Meta<typeof SectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
