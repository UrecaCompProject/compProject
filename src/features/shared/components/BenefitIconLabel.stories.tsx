import disney from '@/assets/images/benefit-plus-disneyplus.svg';
import genie from '@/assets/images/benefit-plus-genie.svg';
import millie from '@/assets/images/benefit-plus-millie.svg';
import netflix from '@/assets/images/benefit-plus-netflix.svg';
import sam from '@/assets/images/benefit-plus-sam.svg';
import tving from '@/assets/images/benefit-plus-tving.svg';
import youtube from '@/assets/images/benefit-plus-youtube.svg';

import BenefitIconLabel from './BenefitIconLabel';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/BenefitIconLabel',
  component: BenefitIconLabel,
  args: {
    imageUrl: netflix,
    label: '넷플릭스',
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 10, max: 40, step: 1 },
      description: '로고 원형 배경의 지름(px). 기본 15px.',
    },
  },
} satisfies Meta<typeof BenefitIconLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: { size: 32 },
};

export const Small: Story = {
  args: { size: 12 },
};

/**
 * 프리미엄플러스/데일리플러스 선택지 목록처럼 여러 개를 세로로 나열하는 실제 사용 형태.
 * 라벨 간 세로 간격은 8px(gap-2).
 * 원본(정사각형, 투명배경) 로고를 넣으면 컴포넌트가 원형 배경을 씌워준다.
 */
export const OptionList: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <BenefitIconLabel imageUrl={youtube} label="유튜브 프리미엄" />
      <BenefitIconLabel imageUrl={disney} label="디즈니+" />
      <BenefitIconLabel imageUrl={tving} label="티빙" />
      <BenefitIconLabel imageUrl={netflix} label="넷플릭스" />
      <BenefitIconLabel imageUrl={millie} label="밀리의 서재" />
      <BenefitIconLabel imageUrl={genie} label="지니(genie)" />
      <BenefitIconLabel imageUrl={sam} label="교보문고 sam" />
    </div>
  ),
};

export const LongLabel: Story = {
  args: {
    label: '아주 긴 부가서비스 이름이 들어가는 경우 확인용 텍스트',
  },
};
