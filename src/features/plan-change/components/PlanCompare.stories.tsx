import disney from '@/assets/images/benefit-plus-disneyplus.svg';
import genie from '@/assets/images/benefit-plus-genie.svg';
import millie from '@/assets/images/benefit-plus-millie.svg';
import netflix from '@/assets/images/benefit-plus-netflix.svg';
import sam from '@/assets/images/benefit-plus-sam.svg';
import tving from '@/assets/images/benefit-plus-tving.svg';
import youtube from '@/assets/images/benefit-plus-youtube.svg';

import PlanCompare from './PlanCompare';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'plan-change/PlanCompare',
  component: PlanCompare,
  args: {
    data: {
      currentPlanName: '요금 걱정없는 5G 20GB',
      currentFee: '78,000원',
      currentDiscount: '월 63,750원',
      currentData: '20GB + 400Kbps 무제한',
      currentTethering: '월 제공량 20GB 초과시 차단',
      currentShareData: '월 제공량 내 차감',
      currentVoice: '기본 제공 (월 300분)',
      currentMessage: '기본 제공 (월 300건)',

      selectedPlanName: '데이터 플랜 31GB(유쓰혜택)',
      selectedFee: '61,000원',
      selectedDiscount: '월 78,750원',
      selectedData: '31GB + 1Mbps 무제한',
      selectedTethering: '월 제공량 46GB 초과시 차단',
      selectedShareData: '월 제공량 내 차감',
      selectedVoice: '기본 제공 (월 300분)',
      selectedMessage: '기본 제공 (월 300건)',

      benefitRows: [
        {
          key: 'premiumPlus',
          label: '프리미엄플러스',
          current: '해당없음',
          selectedSummary: '총 13개\n최대 35,000원',
          selectedSubtext: '(1개 선택)',
          selectedOptions: [
            { imageUrl: disney, label: '디즈니+' },
            { imageUrl: netflix, label: '넷플릭스' },
            { imageUrl: tving, label: '티빙' },
            { imageUrl: youtube, label: '유튜브 프리미엄' },
          ],
        },
        {
          key: 'dailyPlus',
          label: '데일리플러스',
          current: '해당없음',
          selectedSummary: '총 5개\n최대 15,000원',
          selectedSubtext: '(1개 선택)',
          selectedOptions: [
            { imageUrl: millie, label: '밀리의 서재' },
            { imageUrl: sam, label: '교보문고 sam' },
            { imageUrl: genie, label: '지니뮤직(genie)' },
          ],
        },
      ],
    },
  },
} satisfies Meta<typeof PlanCompare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutBenefitRows: Story = {
  args: {
    data: {
      ...meta.args.data,
      benefitRows: undefined,
    },
  },
};
