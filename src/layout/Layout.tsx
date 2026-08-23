import { Outlet, useLocation } from 'react-router';

import Header from './Header';
import Navbar from './Navbar';

export default function Layout() {
  const { pathname } = useLocation();
  const isChatPage = pathname.startsWith('/chat');
  const notShowNavbar = pathname.startsWith('/chat');

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

      {!notShowNavbar && <Navbar />}
    </div>
  );
}
