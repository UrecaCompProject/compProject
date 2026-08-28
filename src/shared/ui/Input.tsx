import type { InputHTMLAttributes } from 'react';

type InputVariant = 'default' | 'error';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  variant?: InputVariant;
  size?: InputSize;
}

const InputColorVariants: Record<InputVariant, string> = {
  default:
    'border border-border bg-surface-page focus:border-brand-promo-primary disabled:bg-surface-pressed disabled:text-fg-disabled',
  error:
    'border border-error focus:border-error disabled:bg-surface-pressed disabled:text-fg-disabled',
};

const InputSizeVariants: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-caption rounded-[6px]',
  md: 'h-[45px] px-4 text-body rounded-full',
  lg: 'h-[50px] px-5 text-body-lg rounded-[12px]',
};

export default function Input({
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: InputProps) {
  return (
    <input
      className={`w-full box-border bg-bg text-fg-primary outline-none transition-colors 
        placeholder:text-fg-disabled 
        disabled:cursor-not-allowed 
        ${InputColorVariants[variant]} 
        ${InputSizeVariants[size]} 
        ${className}
        `}
      {...props}
    />
  );
}
