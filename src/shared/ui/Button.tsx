import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'chip' | 'outline';
type ButtonSize = 'chip' | 'icon' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  round?: boolean;
}

/**
 * 색상 위계 (높음 → 낮음)
 * - primary: 화면당 1개의 주요 액션. 진한 브랜드 채움 + 흰 글자.
 * - outline: 중간 강조. 옅은 브랜드 테두리.
 * - secondary: 낮은 강조(고스트). 채움 거의 없이 브랜드 글자만.
 * - chip: 선택형(토글) 액션.
 *
 * 상태는 색상으로 구분한다 (형태 변화·눌림 애니메이션 없음).
 * - hover: 마우스 오버 (100ms 페이드)
 * - active: 누르는 중(:active) — 색이 한 단계 진해짐 (즉시 반영, 페이드 없음)
 * - aria-pressed: 토글이 켜진 상태
 * - disabled: 비활성
 */
const ButtonColorVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-promo-primary text-white hover:bg-brand-promo-secondary active:bg-brand-promo-secondary aria-pressed:bg-brand-promo-secondary disabled:bg-surface-pressed disabled:text-brand-light',
  secondary:
    'bg-surface-page text-brand-primary hover:bg-bg-pressed disabled:text-fg-disabled',
  chip: 'bg-white text-fg-tertiary border border-border hover:bg-surface-pressed hover:text-brand-primary hover:border-border-brand aria-pressed:bg-surface-pressed aria-pressed:text-brand-primary aria-pressed:border-border-brand',
  outline:
    'border border-border-brand text-brand-promo-secondary bg-white hover:bg-brand-soft active:bg-brand-soft aria-pressed:bg-brand-soft aria-pressed:border-brand-promo-primary disabled:text-fg-disabled disabled:border-border',
};

const ButtonSizeVariants: Record<ButtonSize, string> = {
  chip: 'px-3 py-2 text-caption rounded-full text-chip',
  icon: 'p-3',
  sm: 'h-8 px-3 rounded-[8px] text-caption leading-[130%]',
  md: 'h-[45px] px-5 py-3 text-body rounded-[8px]',
  lg: 'h-[50px] px-6 py-4 text-body-lg rounded-[12px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  active = false,
  round = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      aria-pressed={active}
      className={`inline-flex box-border items-center justify-center transition-colors duration-100 active:duration-0 cursor-pointer disabled:cursor-not-allowed ${ButtonColorVariants[variant]} ${ButtonSizeVariants[size]} ${round ? 'rounded-full' : ''} ${className}`}
      {...props}
    />
  );
}
