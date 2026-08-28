import gs25Image from '@/assets/images/gs25-10000.png';
import lguImage from '@/assets/images/lgu-data-5gb.png';

import type { Coupon } from '../types';

export const coupons: Coupon[] = [
  {
    id: 'gs25-10000',
    name: '1만원 상품권',
    brand: 'GS25',
    imageUrl: gs25Image,
    expiresAt: '2026.09.30',
    status: 'available',
  },
  {
    id: 'lgu-5gb',
    name: '5GB 데이터 상품권',
    brand: 'LG U+',
    imageUrl: lguImage,
    expiresAt: '2026.10.15',
    status: 'available',
  },
];
