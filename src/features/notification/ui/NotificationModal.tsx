import dayjs from 'dayjs';
import { Bell, Clock, Ticket } from 'lucide-react';

import { useExpiringCoupons } from '@/entities/reward';
import type { CouponRow } from '@/entities/reward';

// 만료까지 남은 일수 계산 — 0일이면 "오늘 만료"
function getDaysUntilExpiry(expiredAt: string): number {
  return dayjs(expiredAt).startOf('day').diff(dayjs().startOf('day'), 'day');
}

function NotificationItem({ coupon }: { coupon: CouponRow }) {
  const daysLeft = getDaysUntilExpiry(coupon.expiredAt ?? '');
  const productName = coupon.product?.name ?? '상품';
  const expiredDate = coupon.expiredAt
    ? dayjs(coupon.expiredAt).format('YYYY.MM.DD')
    : '-';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-page p-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-promo-soft">
        <Ticket size={20} className="text-brand-promo-primary" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="text-medium-14-130 text-fg-primary">{productName}</div>
        <div className="flex items-center gap-1 text-medium-12-130 text-fg-tertiary">
          <Clock size={12} />
          {expiredDate} 까지
        </div>
      </div>
      <div
        className={`shrink-0 text-semibold-12-130 ${
          daysLeft <= 1 ? 'text-semantic-error' : 'text-brand-promo-primary'
        }`}
      >
        {daysLeft === 0 ? '오늘 만료' : `${daysLeft}일 남음`}
      </div>
    </div>
  );
}

export default function NotificationModal() {
  const { data: expiringCoupons, isLoading, isError } = useExpiringCoupons(3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-body text-fg-tertiary">
        알림을 불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-body text-fg-tertiary">
        <Bell size={24} className="text-fg-tertiary" />
        알림을 불러오지 못했어요.
      </div>
    );
  }

  if (!expiringCoupons || expiringCoupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-body text-fg-tertiary">
        <Bell size={24} className="text-fg-tertiary" />
        새로운 알림이 없어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-medium-12-130 text-fg-tertiary">
        만료가 임박한 쿠폰이 {expiringCoupons.length}개 있어요.
      </p>
      {expiringCoupons.map((coupon) => (
        <NotificationItem key={coupon.id} coupon={coupon} />
      ))}
    </div>
  );
}
