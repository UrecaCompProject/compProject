import { useEffect } from 'react';
import type { RefObject } from 'react';

// active인 동안 ref로 지정한 요소 바깥을 클릭하면 onClickOutside를 호출한다.
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClickOutside: () => void,
) {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClickOutside();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [ref, active, onClickOutside]);
}
