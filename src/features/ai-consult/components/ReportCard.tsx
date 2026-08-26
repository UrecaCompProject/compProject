import { AlertCircle, Banknote, CheckCircle, FileText } from 'lucide-react';

import { Card } from '@/features/shared';
import IconBadge from '@/features/shared/components/IconBadge';
import type { ReportOutput } from '@/lib/aiConsult';

interface ReportCardProps {
  report: ReportOutput;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-body-sm text-fg-tertiary">{label}</span>
      <span className="text-body-sm text-fg-primary text-right">{value}</span>
    </div>
  );
}

export default function ReportCard({ report }: ReportCardProps) {
  return (
    <Card border="primary" radius="16" gap="16" className="mt-3">
      <div className="flex items-center gap-2">
        <IconBadge icon={FileText} color="brand" size={32} radius={8} />
        <h4 className="text-body font-semibold text-fg-primary">상담 레포트</h4>
      </div>

      <p className="text-body-sm text-fg-secondary leading-relaxed">
        {report.summary}
      </p>

      <div className="bg-surface-page rounded-2xl p-4 space-y-3">
        <InfoRow
          label="사용자 유형"
          value={
            <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-caption text-brand-primary">
              {report.usageType}
            </span>
          }
        />
        <InfoRow label="현재 요금제" value={report.currentPlan || '-'} />
        <InfoRow
          label="추천 요금제"
          value={
            report.recommendedPlans.length > 0
              ? report.recommendedPlans.join(', ')
              : '-'
          }
        />
      </div>

      {report.monthlySavingAmount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-accent-soft p-4">
          <IconBadge
            icon={Banknote}
            color="accent-primary"
            size={40}
            radius={8}
          />
          <div>
            <p className="text-caption text-fg-tertiary">예상 월 절감액</p>
            <p className="text-title font-bold text-accent-primary">
              {report.monthlySavingAmount.toLocaleString()}원
            </p>
          </div>
        </div>
      )}

      {report.importantConditions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconBadge
              icon={AlertCircle}
              color="accent-purple"
              size={24}
              radius={6}
            />
            <span className="text-body-sm font-medium text-fg-primary">
              주요 조건
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.importantConditions.map((condition, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-surface-page px-3 py-1.5 text-caption text-fg-secondary"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      {report.recommendationReason && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconBadge icon={CheckCircle} color="brand" size={24} radius={6} />
            <span className="text-body-sm font-medium text-fg-primary">
              추천 이유
            </span>
          </div>
          <p className="text-body-sm text-fg-secondary leading-relaxed">
            {report.recommendationReason}
          </p>
        </div>
      )}
    </Card>
  );
}
