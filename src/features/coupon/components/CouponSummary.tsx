type CouponSummaryProps = {
  count: number;
};

export default function CouponSummary({ count }: CouponSummaryProps) {
  return (
    <section>
      <p className="text-title text-fg-primary">사용할 수 있는 쿠폰이</p>

      <p className="text-title text-brand-promo-primary">{count}개 있어요</p>
    </section>
  );
}
