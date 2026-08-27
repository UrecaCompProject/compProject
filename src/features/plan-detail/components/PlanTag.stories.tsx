import PlanTag from './PlanTag';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'plan-detail/PlanTag',
  component: PlanTag,
  args: {
    label: '통합요금제+세그혜택',
  },
} satisfies Meta<typeof PlanTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RowOfTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PlanTag label="통합요금제+세그혜택" />
      <PlanTag label="중용량" />
      <PlanTag label="청년 (만 19세 ~ 34세)" />
    </div>
  ),
};
