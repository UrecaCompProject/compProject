import type { ReactNode } from 'react';

import { Modal } from '@/shared';

import Header from './Header';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col overflow-clip bg-surface-pressed">
      <Header />

      {children}

      <Modal />
    </div>
  );
}
