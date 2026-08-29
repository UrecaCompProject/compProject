import { BarChart, ChevronRight } from 'lucide-react';

import type { ReportRow } from '../api/getReport';

interface PreviewReportProps {
  report: ReportRow;
  onClick?: () => void;
}

function formatReportDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`;
}

export default function PreviewReport({ report, onClick }: PreviewReportProps) {
  const planCount = report.analysis_input.recommendedPlans.length;

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
        <div className="text-chip">
          {report.summary_title ??
            formatReportDate(report.created_at) + ' 리포트'}
        </div>
        <div className="text-regular-12-130 mt-0.5 text-fg-tertiary">
          추천 요금제 {planCount}개 · {report.analysis_input.usageType} ·{' '}
          {formatReportDate(report.created_at)}
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
