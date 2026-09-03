import { SquareChartGantt } from 'lucide-react';

import { Card } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { splitSentences } from '../lib/reportDetailHelpers';

interface ReportSummaryCardProps {
  summary: string;
  usageType: string;
  importantConditions: string[];
  changedPlan: RecommendedPlan | null;
}

export default function ReportSummaryCard({
  summary,
  usageType,
  importantConditions,
  changedPlan,
}: ReportSummaryCardProps) {
  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">상담 요약</div>
      <div className="flex flex-col">
        {splitSentences(summary).map((sentence, idx) => (
          <span
            key={idx}
            className="wrap-normal break-keep leading-[140%] text-[14px]"
          >
            {sentence}
          </span>
        ))}
      </div>
      {changedPlan?.planName && (
        <>
          <div className="text-bold-16-140">요금제 변경</div>
          <div className="border-2 border-brand-promo-primary px-4 py-3 rounded-2xl flex gap-4 items-center">
            <div className="rounded-lg p-2 bg-surface-page w-10 h-10">
              <SquareChartGantt className="text-brand-promo-primary" />
            </div>
            <div className="py-0.5">
              <div className="font-medium">{changedPlan.planName}</div>
              {changedPlan.reason && (
                <div className="mt-0.5 wrap-normal break-keep text-[12px] text-fg-tertiary">
                  {changedPlan.reason}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1 font-medium text-[14px] text-brand-promo-primary">
          <span className="wrap-normal break-keep"># {usageType}</span>
          {importantConditions.map((condition) => (
            <div key={condition} className="wrap-normal break-keep">
              # {condition}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
