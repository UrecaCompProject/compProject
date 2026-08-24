import { Bell, Menu } from 'lucide-react';
import { matchPath, useLocation } from 'react-router';

const pageTitles: { path: string; title: string }[] = [
  { path: '/', title: 'MY' },
  { path: '/main/:id', title: '내 요금제 상세 정보' },
  { path: '/chat', title: 'AI 채팅' },
  { path: '/plan', title: '요금제' },
  { path: '/plan/:id', title: '요금제 상세' },
  { path: '/plan/:id/change', title: '요금제 조회/변경' },
  { path: '/plan/:id/change/result', title: '요금제 조회/변경' },
  { path: '/event', title: '혜택/이벤트' },
  { path: '/event/store', title: '혜택/이벤트' },
  { path: '/event/coupon', title: '혜택/이벤트' },
];

export default function Header() {
  const { pathname } = useLocation();
  // const navigate = useNavigate();

  const title =
    pageTitles.find(({ path }) => matchPath(path, pathname))?.title ?? '';
  // const showBack = pathname !== '/';

  return (
    <div className="sticky top-0 w-full bg-surface-card flex gap-3 px-4 py-3 items-center border-b border-border">
      {/* {showBack && (
        <ChevronLeft
          className="shrink-0 cursor-pointer"
          onClick={() => navigate(-1)}
        />
      )} */}
      <div className="w-full text-title">{title}</div>
      <Bell size={22} className="shrink-0" />
      <Menu size={22} className="shrink-0" />
    </div>
  );
}
