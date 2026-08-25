import { Outlet, useLocation } from 'react-router';

import { Modal } from '@/features/shared';

import Header from './Header';

export default function Layout() {
  const { pathname } = useLocation();
  const isChatPage = pathname === '/';
  // const notShowNavbar = pathname.startsWith('/chat');

  return (
    <div
      className={`relative ${
        isChatPage
          ? 'flex h-screen flex-col overflow-hidden bg-surface-pressed'
          : 'min-h-screen bg-surface-page'
      }`}
    >
      <Header />

      <Outlet />

      {/* {!notShowNavbar && <Navbar />} */}

      <Modal />
    </div>
  );
}
