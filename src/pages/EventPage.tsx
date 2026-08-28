import { useNavigate } from 'react-router';

import { RewardHome } from '@/features/reward';

export default function EventPage() {
  const navigate = useNavigate();

  return (
    <main className="bg-surface-page pb-28">
      <RewardHome
        onStoreClick={() => navigate('/event/store')}
        onCouponClick={() => navigate('/event/coupon')}
      />
    </main>
  );
}
