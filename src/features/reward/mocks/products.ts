import elevenstreetImage from '@/assets/images/11street-addon.png';
import sevenelevenImage from '@/assets/images/7eleven-coupon.png';
import gs25Image from '@/assets/images/gs25-10000.png';
import lguDataImage from '@/assets/images/lgu-data-5gb.png';
import wavveImage from '@/assets/images/wavve-1month.png';

import type { RewardProduct } from '../types';

export const products: RewardProduct[] = [
  {
    id: 1,
    brand: 'GS25',
    name: '1만원 상품권',
    imageUrl: gs25Image,
    badgeCost: 100,
  },
  {
    id: 2,
    brand: 'LG U+',
    name: '5G 데이터 상품권 5GB',
    imageUrl: lguDataImage,
    badgeCost: 100,
  },

  {
    id: 3,
    brand: 'wavve',
    name: '상품권',
    imageUrl: wavveImage,
    badgeCost: 100,
  },

  {
    id: 4,
    brand: '7eleven',
    name: '상품권',
    imageUrl: sevenelevenImage,
    badgeCost: 100,
  },

  {
    id: 5,
    brand: '11번가',
    name: '상품권',
    imageUrl: elevenstreetImage,
    badgeCost: 100,
  },
];
