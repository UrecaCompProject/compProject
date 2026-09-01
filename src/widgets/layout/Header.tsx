import { Bell, UserRound, DoorOpen } from 'lucide-react';

import { useExpiringCoupons } from '@/entities/reward';
import { useIsLoggedIn, SigninModal, LogoutCheckModal } from '@/features/auth';
import { NotificationModal } from '@/features/notification';
import { useModalStore } from '@/shared';

export default function Header() {
  const isLogin = useIsLoggedIn();
  const { open } = useModalStore();
  const { data: expiringCoupons } = useExpiringCoupons(3);
  const hasExpiringCoupons = !!expiringCoupons && expiringCoupons.length > 0;

  return (
    <div className="sticky top-0 w-full bg-surface-card flex gap-3 px-4 py-3 items-center border-b border-border">
      <div className="w-full text-title">Ephyra</div>
      <button
        type="button"
        aria-label="알림"
        className="relative flex shrink-0 cursor-pointer items-center justify-center"
        onClick={() =>
          open({
            title: '알림',
            content: <NotificationModal />,
          })
        }
      >
        <Bell size={22} />
        {hasExpiringCoupons && (
          <span className="absolute right-1 top-0.5 h-2.5 w-2.5 rounded-full bg-semantic-error ring-2 ring-surface-card" />
        )}
      </button>
      {isLogin ? (
        <DoorOpen
          size={22}
          className="shrink-0"
          onClick={() =>
            open({
              title: '알림',
              content: <LogoutCheckModal />,
            })
          }
        />
      ) : (
        <UserRound
          size={22}
          className="shrink-0"
          onClick={() =>
            open({
              title: '회원관리',
              content: <SigninModal />,
            })
          }
        />
      )}
    </div>
  );
}
