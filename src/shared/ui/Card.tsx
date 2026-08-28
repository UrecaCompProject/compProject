import type { HTMLAttributes, Ref } from 'react';

type BorderVariant = 'none' | 'default' | 'primary';
type GapVariant = 'none' | '8' | '12' | '16';
type RadiusVariant = 'none' | '8' | '16' | 'rounded';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  border?: BorderVariant;
  radius?: RadiusVariant;
  gap?: GapVariant;
  shadow?: boolean;
  ref?: Ref<HTMLDivElement>;
}

const CardBorderVariants: Record<BorderVariant, string> = {
  none: '',
  default: 'border border-border',
  primary: 'border border-border-brand',
};

const CardGapVariants: Record<GapVariant, string> = {
  none: '',
  8: 'gap-2',
  12: 'gap-3',
  16: 'gap-4',
};

const CardRadiusVariants: Record<RadiusVariant, string> = {
  none: '',
  8: 'rounded-[8px]',
  16: 'rounded-[16px]',
  rounded: 'rounded-full',
};

export default function Card({
  border = 'none',
  radius = '16',
  gap = '12',
  shadow = false,
  className = '',
  ref,
  ...props
}: CardProps) {
  return (
    <div
      ref={ref}
      className={`p-4 rounded-2xl flex flex-col bg-white
        ${border ? CardBorderVariants[border] : ''}
        ${radius ? CardRadiusVariants[radius] : ''}
        ${gap ? CardGapVariants[gap] : ''}
        ${shadow ? 'shadow-shadow' : ''}
        ${className}
    `}
      {...props}
    />
  );
}
