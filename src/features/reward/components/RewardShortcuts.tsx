import couponBannerImage from '@/assets/images/to-coupon-box.png';
import storeBannerImage from '@/assets/images/to-store-banner.png';

type RewardShortcutsProps = {
  onStoreClick: () => void;
  onCouponClick: () => void;
};

export default function RewardShortcuts({
  onStoreClick,
  onCouponClick,
}: RewardShortcutsProps) {
  return (
    <section className="grid grid-cols-2 gap-2 px-4 py-3">
      <button
        type="button"
        onClick={onStoreClick}
        className="overflow-hidden rounded-xl"
      >
        <img
          src={storeBannerImage}
          alt="모은 배지로 교환하는 상점 바로가기"
          className="block h-auto w-full"
        />
      </button>

      <button
        type="button"
        onClick={onCouponClick}
        className="overflow-hidden rounded-xl"
      >
        <img
          src={couponBannerImage}
          alt="교환한 혜택을 확인하는 나의 쿠폰함"
          className="block h-auto w-full"
        />
      </button>
    </section>
  );
}
