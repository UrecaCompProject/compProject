import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'chip' | 'outline';
type ButtonSize = 'chip' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const ButtonColorVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-promo-primary text-white hover:bg-brand-promo-secondary disabled:bg-surface-pressed disabled:text-brand-light',
  secondary:
    'bg-surface-page text-brand-primary hover:bg-bg-pressed disabled:text-fg-disabled',
  chip: 'bg-white text-fg-tertiary border border-border focus:bg-surface-pressed focus:text-brand-primary focus:border-border-brand',
  outline:
    'border border-brand-promo-primary text-brand-promo-secondary hover:bg-bg-subtle disabled:text-fg-disabled disabled:border-border',
};

const ButtonSizeVariants: Record<ButtonSize, string> = {
  chip: 'px-3 py-2 text-caption rounded-full text-chip',
  sm: 'h-8 px-3 text-caption',
  md: 'h-[45px] px-5 py-3 text-body rounded-[8px]',
  lg: 'h-[50px] px-6 py-4 text-body-lg rounded-[12px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex box-border items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed ${ButtonColorVariants[variant]} ${ButtonSizeVariants[size]} ${className}`}
      {...props}
    />
  );
}
