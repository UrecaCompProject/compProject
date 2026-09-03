import Button from './Button';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/Button',
  component: Button,
  args: {
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Chip: Story = {
  args: { variant: 'chip' },
};

export const Pressed: Story = {
  args: { variant: 'chip', size: 'chip', active: true },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
};

export const Hierarchy: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary">주요 액션</Button>
        <Button variant="outline">중간 강조</Button>
        <Button variant="secondary">낮은 강조</Button>
        <Button variant="chip" size="chip">
          선택형
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" disabled>
          비활성
        </Button>
        <Button variant="chip" size="chip" active>
          선택됨
        </Button>
      </div>
    </div>
  ),
};
