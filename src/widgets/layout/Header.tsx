import { UserRound, LogOut } from 'lucide-react';

// import { useExpiringCoupons } from '@/entities/reward';
import { useIsLoggedIn, SigninModal, LogoutCheckModal } from '@/features/auth';
import { useModalStore } from '@/shared';

export default function Header() {
  const isLogin = useIsLoggedIn();
  const { open } = useModalStore();
  // const { data: expiringCoupons } = useExpiringCoupons(3);
  // const hasExpiringCoupons = !!expiringCoupons && expiringCoupons.length > 0;

  return (
    <div className="sticky top-0 flex items-center w-full gap-3 px-4 py-3 border-b bg-surface-card border-border">
      <div className="w-full text-title">Ephyra</div>
      {/* <button
        type="button"
        aria-label="알림"
        className="relative flex items-center justify-center cursor-pointer shrink-0"
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
      </button> */}
      {isLogin ? (
        <LogOut
          size={20}
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
              title: '로그인',
              content: <SigninModal />,
            })
          }
        />
      )}
    </div>
  );
}
