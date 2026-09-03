interface BenefitIconLabelProps {
  imageUrl: string;
  label: string;
  size?: number;
  className?: string;
  labelClassName?: string;
}

export default function BenefitIconLabel({
  imageUrl,
  label,
  size = 15,
  className = '',
  labelClassName = 'text-[10px] font-medium text-fg-primary',
}: BenefitIconLabelProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className="flex items-center justify-center overflow-hidden bg-white rounded-full shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src={imageUrl}
          alt={label}
          className="object-contain w-full h-full"
        />
      </div>
      <span className={labelClassName}>{label}</span>
    </div>
  );
}
