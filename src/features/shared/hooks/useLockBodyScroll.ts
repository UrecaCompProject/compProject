import { useEffect } from 'react';

// active인 동안 body 스크롤을 막고, 벗어나면 원래 값으로 되돌린다.
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
