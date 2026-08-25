import { useNavigate } from 'react-router';

import { RewardHome } from '@/features/reward';

/**
 * Renders the reward home screen and handles navigation to the store and coupon pages.
 */
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
