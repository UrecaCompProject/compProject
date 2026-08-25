import type { ReactNode } from 'react';

import { create } from 'zustand';

interface ModalOptions {
  title?: string;
  description?: string;
  content: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
  className?: string;
}

interface ModalState {
  isOpen: boolean;
  options: ModalOptions | null;
  open: (options: ModalOptions) => void;
  close: () => void;
}

// 화면에 모달은 한 번에 하나만 떠 있으면 되므로, 각 기능이 자기 state로
// Modal을 따로 마운트하는 대신 이 store를 통해 전역에서 하나만 다룬다.
// 실제 렌더링은 앱 루트에 한 번만 마운트되는 GlobalModal이 담당한다.
export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  options: null,
  open: (options) => set({ isOpen: true, options }),
  close: () => set({ isOpen: false }),
}));
