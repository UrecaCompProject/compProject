import { BenefitIconLabel } from '@/shared';

export interface BenefitOption {
  imageUrl: string;
  label: string;
}

interface PlanCompareBenefitRowProps {
  label: string;
  current: string;
  selectedSummary: string;
  selectedSubtext?: string;
  selectedOptions?: BenefitOption[];
}

export default function PlanCompareBenefitRow({
  label,
  current,
  selectedSummary,
  selectedSubtext,
  selectedOptions = [],
}: PlanCompareBenefitRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-medium text-compare-neutral">{label}</p>
        <p className="text-[14px] font-semibold text-fg-primary">{current}</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-medium text-compare-selected">{label}</p>
        <p className="whitespace-pre-line text-[14px] font-bold text-compare-selected">
          {selectedSummary}
        </p>
        {selectedSubtext && (
          <p className="text-[12px] text-fg-tertiary">{selectedSubtext}</p>
        )}
        {selectedOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            {selectedOptions.map((option) => (
              <BenefitIconLabel
                key={option.label}
                imageUrl={option.imageUrl}
                label={option.label}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
