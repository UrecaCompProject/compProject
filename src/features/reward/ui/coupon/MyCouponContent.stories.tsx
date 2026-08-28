import CouponBox from './MyCouponContent';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'coupon/CouponBox',
  component: CouponBox,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'surface-page',
    },
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-[390px] bg-surface-page px-4 py-4">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof CouponBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
