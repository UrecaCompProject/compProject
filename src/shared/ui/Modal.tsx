import { useState } from 'react';

import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { useEscapeKey } from '../hooks/useEscapeKey';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useModalStore } from '../store/useModalStore';

type Phase = 'closed' | 'open' | 'closing';

export default function Modal() {
  // 전역으로 사용하는 모달
  const { isOpen, options, close } = useModalStore();
  // dismissible : 모달 외부 클릭 시 닫을 수 있는지 여부. 기본값 true
  const dismissible = options?.dismissible ?? true;

  // isOpen이 false가 된 직후에도 닫힘 애니메이션이 끝날 때까지는 계속 그려야 하므로,
  // store의 isOpen을 그대로 쓰지 않고 open → closing → closed 3단계로 나눠서 관리한다.
  // (isOpen이 바뀐 걸 렌더 중에 바로 반영하는 공식 패턴 — effect 없이 상태를 맞춘다.)
  const [phase, setPhase] = useState<Phase>('closed');
  const [syncedIsOpen, setSyncedIsOpen] = useState(isOpen);
  if (isOpen !== syncedIsOpen) {
    setSyncedIsOpen(isOpen);
    setPhase(isOpen ? 'open' : 'closing');
  }

  // 닫히는 동안에도 직전 내용을 그대로 보여주기 위해 options를 기억해둔다.
  // (렌더 중 ref를 직접 수정하는 대신, 위와 같은 방식으로 state를 맞춘다.)
  const [renderedOptions, setRenderedOptions] = useState(options);
  if (options && options !== renderedOptions) {
    setRenderedOptions(options);
  }

  const isVisible = phase !== 'closed';
  const isClosing = phase === 'closing';

  useLockBodyScroll(isVisible);
  useEscapeKey(phase === 'open' && dismissible, close);

  if (!isVisible || !renderedOptions) return null;

  // title : 모달 제목
  // description : 모달 설명
  // content : 모달 본문
  // footer : 모달 하단 영역
  // className : 모달 컨테이너 추가 클래스
  const {
    title,
    description,
    content,
    footer,
    className = '',
  } = renderedOptions;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 검은 배경 */}
      <div
        className={`fixed inset-0 bg-fg-primary/50 animation-fade-in
          ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}
          `}
        onClick={() => dismissible && close()}
      />

      {/* 카드 흰 배경 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onAnimationEnd={() => {
          if (isClosing) setPhase('closed');
        }}
        className={`p-5 relative z-10 flex max-h-[85dvh] w-full max-w-[320px] flex-col rounded-2xl bg-surface-card outline-none ${isClosing ? 'animate-scale-out' : 'animate-scale-in'} ${className}`}
      >
        <button
          type="button"
          aria-label="모달 닫기"
          onClick={close}
          className="absolute right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full text-fg-tertiary transition-colors hover:bg-surface-page hover:text-fg-secondary"
        >
          <X size={18} />
        </button>

        <header className="shrink-0">
          {title && (
            <h2
              id="modal-title"
              className="text-title text-fg-primary text-center"
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-caption text-fg-tertiary text-center">
              {description}
            </p>
          )}
        </header>

        <div
          data-vaul-no-drag
          className="min-h-0 flex-1 touch-pan-y overscroll-contain overflow-y-auto pt-3"
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
          {content}
        </div>

        {footer && (
          <footer className="shrink-0 border-t border-border pb-5 pt-5">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
