import { Outlet, useLocation } from 'react-router';
import { Header, Navbar } from '@/layout';

export default function Layout() {
  const { pathname } = useLocation();
  const isChatPage = pathname.startsWith('/chat');
  const notShowNavbar = pathname.startsWith('/chat');

  return (
    <div
      className={`min-h-screen ${isChatPage ? 'bg-surface-pressed' : 'bg-surface-page'}`}
    >
      <Header />
      <div className="px-4">
        <Outlet />
      </div>
      {!notShowNavbar && <Navbar />}
    </div>
  );
}
