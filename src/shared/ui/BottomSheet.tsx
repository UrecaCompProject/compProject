import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';

import { ChevronLeft, X } from 'lucide-react';
import { Drawer } from 'vaul';

type BottomSheetSize = 'content' | 'large' | 'full';

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: BottomSheetSize;
  dismissible?: boolean;
  className?: string;
  bodyClassName?: string;
  // 이 값이 바뀔 때마다 본문 스크롤을 맨 위로 되돌린다.
  // (children이 바뀌어도 스크롤 컨테이너 자체는 계속 마운트되어 있어 scrollTop이 유지되기 때문)
  scrollResetKey?: string | number;
  /**
   * 외부에서 본문 스크롤 컨테이너를 직접 제어해야 할 때 전달한다.
   * 전달하지 않으면 내부 ref를 사용한다.
   */
  bodyRef?: RefObject<HTMLDivElement | null>;
};

const sizeClasses: Record<BottomSheetSize, string> = {
  content: 'max-h-[60dvh]',
  large: 'h-[85dvh]',
  full: 'h-[calc(100dvh-24px)]',
};

export default function BottomSheet({
  open,
  onOpenChange,
  onBack,
  title,
  description,
  children,
  footer,
  size = 'large',
  dismissible = true,
  className = '',
  bodyClassName = 'px-5',
  scrollResetKey,
  bodyRef: externalBodyRef,
}: BottomSheetProps) {
  const internalBodyRef = useRef<HTMLDivElement>(null);
  const bodyRef = externalBodyRef ?? internalBodyRef;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [scrollResetKey, bodyRef]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction="bottom"
      dismissible={dismissible}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="
            fixed inset-0 z-40
            bg-fg-primary/50
          "
        />

        <Drawer.Content
          className={`
            fixed bottom-0 left-1/2 z-50
            flex w-full max-w-[768px]
            -translate-x-1/2 flex-col
            rounded-t-3xl bg-surface-card
            outline-none
            transition-[height,max-height] duration-300 ease-out
            ${sizeClasses[size]}
            ${className}
          `}
        >
          <Drawer.Handle
            className="
              mx-auto mt-3 h-1.5 w-12
              shrink-0 rounded-full
              bg-border-strong
            "
          />

          <div className="flex min-h-0 flex-1 flex-col">
            <header className="shrink-0 px-5 pb-3 pt-4">
              <div className="flex h-8 items-center">
                <span
                  className={`h-8 overflow-hidden transition-[width,margin-left,margin-right] duration-300 ${
                    onBack ? '-ml-3 w-8 mr-1' : 'ml-0 w-0 mr-0'
                  }`}
                >
                  <button
                    type="button"
                    aria-label="이전 화면으로 돌아가기"
                    aria-hidden={!onBack}
                    tabIndex={onBack ? 0 : -1}
                    onClick={onBack}
                    className={`inline-flex h-8 w-8 items-center justify-center transition-[transform,opacity] duration-300 ${
                      onBack
                        ? 'translate-x-0 opacity-100'
                        : 'pointer-events-none translate-x-3 opacity-0'
                    }`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                </span>

                <Drawer.Title className="min-w-0 flex-1 truncate text-title text-fg-primary">
                  {title}
                </Drawer.Title>

                <button
                  type="button"
                  aria-label="바텀시트 닫기"
                  onClick={() => onOpenChange(false)}
                  className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-fg-tertiary transition-colors hover:bg-surface-page hover:text-fg-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              {description && (
                <Drawer.Description className="mt-1 text-caption text-fg-tertiary">
                  {description}
                </Drawer.Description>
              )}
            </header>

            <div
              ref={bodyRef}
              className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}
            >
              {children}
            </div>

            {footer && (
              <footer
                className="
                  shrink-0 border-t border-border
                  px-5 pt-4
                  pb-[calc(20px+env(safe-area-inset-bottom))]
                "
              >
                {footer}
              </footer>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
