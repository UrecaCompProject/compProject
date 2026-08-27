import LargeBadge from './LargeBadge';

type StoreTopProps = {
  badgeBalance: number;
};

export default function StoreTop({ badgeBalance }: StoreTopProps) {
  return (
    <section className="relative w-full border-b-2 border-brand-promo-primary bg-surface-card">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-bold-16-140 font-bold text-brand-promo-primary">
          배지 상점
        </h1>

        <LargeBadge
          value={badgeBalance}
          ariaLabel={`보유 배지 ${badgeBalance}개`}
        />
      </div>
    </section>
  );
}
