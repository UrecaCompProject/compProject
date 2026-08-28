import { Bell, Astroid, DoorOpen } from 'lucide-react';

import { useIsLoggedIn, SigninModal, LogoutCheckModal } from '@/features/auth';
import { useModalStore } from '@/shared';

export default function Header() {
  const isLogin = useIsLoggedIn();
  const { open } = useModalStore();

  return (
    <div className="sticky top-0 w-full bg-surface-card flex gap-3 px-4 py-3 items-center border-b border-border">
      <div className="w-full text-title">Ephyra</div>
      <Bell size={22} className="shrink-0" />
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
        <Astroid
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
