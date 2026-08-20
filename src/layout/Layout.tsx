import { Outlet, useLocation } from 'react-router';
import { Header, Navbar, Footer } from '@/layout';

export default function Layout() {
  const { pathname } = useLocation();
  const isChatPage = pathname.startsWith('/chat');
  const notShowNavbar = pathname.startsWith('/chat');

  return (
    <div
      className={`relative min-h-screen ${isChatPage ? 'bg-surface-pressed' : 'bg-surface-page'}`}
    >
      <Header />

      <Outlet />
      <Footer />

      {!notShowNavbar && <Navbar />}
    </div>
  );
}
