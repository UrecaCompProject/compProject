import badgeImage from '@/assets/images/badge.png';

type StoreTopProps = {
  badgeBalance: number;
};

export default function StoreTop({ badgeBalance }: StoreTopProps) {
  return (
    <section className="relative w-full border-b-2 border-brand-promo-primary bg-surface-card">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-[16px] font-bold text-brand-promo-primary">
          배지 상점
        </h1>

        <div
          aria-label={`보유 배지 ${badgeBalance}개`}
          className="inline-flex items-center gap-1 rounded-full border border-reward-locked bg-surface-card px-2 py-1"
        >
          <img src={badgeImage} alt="" className="h-5 w-5" />
          <strong className="text-[16px] leading-none text-brand-promo-primary">
            {badgeBalance.toLocaleString()}
          </strong>
        </div>
      </div>
    </section>
  );
}
