import { useEffect, useState } from 'react';

import { AlertCircle, Banknote, CheckCircle, FileText } from 'lucide-react';

import {
  toRecommendedPlan,
  type PlanRow,
} from '@/features/plan-catalog/api/getPlanCatalog';
import PlanCard from '@/features/plan-catalog/components/PlanCard';
import { toPlanBenefits } from '@/features/plan-catalog/utils/toPlanBenefits';
import { Card } from '@/features/shared';
import IconBadge from '@/features/shared/components/IconBadge';
import type { ReportOutput } from '@/lib/aiConsult';
import { supabaseAnon } from '@/lib/supabaseClient';

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
  const [plans, setPlans] = useState<PlanRow[]>([]);

  useEffect(() => {
    const names = [
      ...new Set(
        [report.currentPlan, ...report.recommendedPlans].filter(Boolean),
      ),
    ];
    if (names.length === 0) return;

    supabaseAnon
      .from('plans')
      .select('*')
      .in('name', names)
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (!error && data) {
          setPlans(data as PlanRow[]);
        }
      });
  }, [report.currentPlan, report.recommendedPlans]);

  const planMap = new Map(plans.map((p) => [p.name, p]));
  const currentPlan =
    report.currentPlan && report.currentPlan !== '미등록'
      ? planMap.get(report.currentPlan)
      : null;
  const recommendedPlans = report.recommendedPlans
    .map((name) => planMap.get(name))
    .filter((p): p is PlanRow => !!p);

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
      </div>

      {currentPlan && (
        <div className="space-y-2">
          <p className="text-caption text-fg-tertiary">현재 요금제</p>
          <PlanCard
            title={currentPlan.name}
            price={currentPlan.monthly_fee}
            benefits={toPlanBenefits(toRecommendedPlan(currentPlan))}
            context="chat"
            className="w-full"
          />
        </div>
      )}

      {recommendedPlans.length > 0 && (
        <div className="space-y-2">
          <p className="text-caption text-fg-tertiary">추천 요금제</p>
          <div className="flex flex-col gap-3">
            {recommendedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                title={plan.name}
                price={plan.monthly_fee}
                benefits={toPlanBenefits(toRecommendedPlan(plan))}
                context="chat"
                className="w-full"
              />
            ))}
          </div>
        </div>
      )}

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
