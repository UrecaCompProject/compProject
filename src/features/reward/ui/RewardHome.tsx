import bannerImage from '@/shared/assets/images/banner1.png';
import couponBannerImage from '@/shared/assets/images/to-coupon-box.png';
import storeBannerImage from '@/shared/assets/images/to-store-banner.png';

import CheckIn from './CheckIn';
import MissionList from './MissionList';

import type { Mission } from '../types';

type RewardHomeProps = {
  onStoreClick: () => void;
  onCouponClick: () => void;
  onMissionAction?: (mission: Mission) => void;
};

export default function RewardHome({
  onStoreClick,
  onCouponClick,
  onMissionAction,
}: RewardHomeProps) {
  return (
    <div className="flex flex-col bg-surface-page">
      {/* 상단 배너 */}
      <section className="overflow-hidden bg-accent-soft">
        <img
          src={bannerImage}
          alt="배지 70개를 모으면 배스킨라빈스 파인트 무료"
          className="block aspect-13/5 w-full object-cover"
        />
      </section>

      {/* 배지 출석체크 컴포넌트 */}
      <CheckIn />

      {/* 상점 & 쿠폰함 바로가기 버튼 */}
      <section className="flex gap-3 p-4">
        <button
          type="button"
          onClick={onStoreClick}
          aria-label="모은 배지로 교환하는 상점 바로가기"
          style={{ backgroundImage: `url(${storeBannerImage})` }}
          className="aspect-181/59 w-full overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat shadow-shadow"
        />

        <button
          type="button"
          onClick={onCouponClick}
          aria-label="교환한 혜택을 확인하는 나의 쿠폰함"
          style={{ backgroundImage: `url(${couponBannerImage})` }}
          className="aspect-181/59 w-full overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat shadow-shadow"
        />
      </section>

      <MissionList onAction={onMissionAction} />
    </div>
  );
}
