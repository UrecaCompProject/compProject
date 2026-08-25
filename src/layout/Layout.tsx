import { useState } from 'react';

import { Outlet, useLocation } from 'react-router';

import { RewardSheet } from '@/features/reward';
import { Modal } from '@/features/shared';

import Header from './Header';
import Navbar from './Navbar';

export default function Layout() {
  const [rewardOpen, setRewardOpen] = useState(false);
  const { pathname } = useLocation();
  const isChatPage = pathname === '/';

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

      <Navbar
        rewardOpen={rewardOpen}
        onRewardClick={() => setRewardOpen(true)}
      />

      <RewardSheet open={rewardOpen} onOpenChange={setRewardOpen} />

      <Modal />
    </div>
  );
}
