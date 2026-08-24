import { useNavigate } from 'react-router';

import { RewardContent } from '@/features/reward/content';

export default function EventPage() {
  const navigate = useNavigate();

  return (
    <main className="bg-surface-page pb-28">
      <RewardContent
        onStoreClick={() => navigate('/event/store')}
        onCouponClick={() => navigate('/event/coupon')}
      />
    </main>
  );
}
