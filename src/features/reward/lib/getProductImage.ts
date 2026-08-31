import elevenstreetImage from '@/shared/assets/images/11street-addon.png';
import sevenelevenImage from '@/shared/assets/images/7eleven-coupon.png';
import gs25Image from '@/shared/assets/images/gs25-10000.png';
import lguDataImage from '@/shared/assets/images/lgu-data-5gb.png';
import wavveImage from '@/shared/assets/images/wavve-1month.png';

// DB의 image는 "gs25-1thousand-coupon" 같은 슬러그라, 금액별 이미지가 없는 지금은
// 브랜드 키워드만 찾아서 브랜드 공용 이미지로 대체한다. 매칭 안 되면 빈 문자열(플레이스홀더 없음).
const BRAND_IMAGE_MAP: [string, string][] = [
  ['gs25', gs25Image],
  ['wavve', wavveImage],
  ['seveneleven', sevenelevenImage],
  ['lguplus', lguDataImage],
  ['elevenstreet', elevenstreetImage],
];

export function getProductImage(slug: string | null): string {
  const matched = BRAND_IMAGE_MAP.find(([key]) => slug?.includes(key));
  return matched?.[1] ?? '';
}
