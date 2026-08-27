import { BarChart, ChevronRight } from 'lucide-react';

interface PreviewReportProps {
  onClick?: () => void;
}

export default function PreviewReport({ onClick }: PreviewReportProps) {
  return (
    <div
      className="p-2 flex gap-2 items-center bg-white rounded-lg border border-white transition-colors hover:border-brand-promo-primary cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-7 h-7 shrink-0">
        <BarChart
          size={20}
          strokeWidth={4}
          className="text-brand-primary shrink-0"
        />
      </div>

      <div className="w-full">
        <div className="text-chip">2026년 08월 10일 리포트</div>
        <div className="text-regular-12-130 mt-0.5 text-fg-tertiary">
          추천 요금제 3개 · 데이터 절감 중심
        </div>
      </div>
      <div className="flex items-center justify-center w-4 h-4 shrink-0">
        <ChevronRight
          size={16}
          className="text-border-strong shrink-0"
          strokeWidth={3}
        />
      </div>
    </div>
  );
}
