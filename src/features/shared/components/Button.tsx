import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-promo-primary text-white hover:bg-brand-promo-secondary disabled:bg-surface-pressed disabled:text-brand-light',
  secondary:
    'bg-surface-page text-brand-primary hover:bg-bg-pressed disabled:text-fg-disabled',
  outline:
    'border border-brand-promo-primary text-brand-promo-secondary hover:bg-bg-subtle disabled:text-fg-disabled disabled:border-border',
};

const sizeClasses: Record<ButtonSize, string> = {
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
      className={`inline-flex box-border items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
