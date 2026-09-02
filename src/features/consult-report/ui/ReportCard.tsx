import { useEffect, useState } from 'react';

import { AlertCircle, Banknote, FileText } from 'lucide-react';

import { toRecommendedPlan, type PlanRow } from '@/entities/plan';
import { PlanCard, toPlanBenefits } from '@/entities/plan';
import CompareResultSheet from '@/features/plan-compare/ui/CompareResultSheet';
import { Card } from '@/shared';
import type { ReportOutput } from '@/shared/lib/aiConsult';
import { supabaseAnon } from '@/shared/lib/supabaseClient';
import IconBadge from '@/shared/ui/IconBadge';

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
  const [currentPlanRow, setCurrentPlanRow] = useState<PlanRow | null>(null);

  useEffect(() => {
    if (!report.currentPlan || report.currentPlan === '미등록') return;

    supabaseAnon
      .from('plans')
      .select('*')
      .eq('name', report.currentPlan)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setCurrentPlanRow(data as PlanRow);
      });
  }, [report.currentPlan]);

  const topSavingAmount =
    report.recommendedPlans[0]?.plans[0]?.savingAmount ?? 0;

  return (
    <Card border="primary" radius="16" gap="16" className="mt-3 mx-4">
      <div className="flex items-center gap-2">
        <IconBadge icon={FileText} color="brand" size={32} radius={8} />
        <h4 className="text-body font-semibold text-fg-primary">상담 레포트</h4>
      </div>

      <p className="text-body-sm text-fg-secondary leading-relaxed">
        {report.otherNotes.summary}
      </p>

      {/* 기타 상담 내용 — LLM이 추출한 핵심 질문/답변 */}
      {report.otherNotes.qaPairs.length > 0 && (
        <div className="bg-surface-page rounded-2xl p-4 space-y-4">
          <p className="text-body-sm font-semibold text-fg-primary">
            상담 요약
          </p>
          {report.otherNotes.qaPairs.map((pair, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-body-sm font-medium text-fg-primary">
                Q{idx + 1}. {pair.question}
              </p>
              <p className="text-body-sm text-fg-secondary">
                A{idx + 1}. {pair.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface-page rounded-2xl p-4 space-y-3">
        {report.otherNotes.usageType && (
          <InfoRow
            label="사용자 유형"
            value={
              <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-caption text-brand-primary">
                {report.otherNotes.usageType}
              </span>
            }
          />
        )}
        <InfoRow label="현재 요금제" value={report.currentPlan || '-'} />
      </div>

      {currentPlanRow && (
        <div className="space-y-2">
          <p className="text-caption text-fg-tertiary">현재 요금제</p>
          <PlanCard
            title={currentPlanRow.name}
            price={currentPlanRow.monthly_fee}
            benefits={toPlanBenefits(toRecommendedPlan(currentPlanRow))}
            context="chat"
            className="w-full"
          />
        </div>
      )}

      {report.recommendedPlans.length > 0 && (
        <div className="space-y-4">
          {report.recommendedPlans.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              <div>
                <p className="text-caption text-fg-tertiary">
                  추천 요금제
                  {report.recommendedPlans.length > 1 ? ` ${groupIdx + 1}` : ''}
                </p>
                {group.target && (
                  <p className="text-caption text-fg-tertiary">
                    {group.detail ? `${group.detail} · ` : ''}
                    {group.target}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {group.plans.map((plan) => (
                  <PlanCard
                    key={plan.planId}
                    title={plan.planName}
                    price={plan.monthlyFee ?? 0}
                    benefits={toPlanBenefits(plan)}
                    reason={plan.reason}
                    context="chat"
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {topSavingAmount > 0 && (
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
              {topSavingAmount.toLocaleString()}원
            </p>
          </div>
        </div>
      )}

      {report.comparedPlan && (
        <div className="space-y-2">
          <p className="text-caption text-fg-tertiary">비교했던 요금제</p>
          <CompareResultSheet result={report.comparedPlan} />
        </div>
      )}

      {report.changedPlan && (
        <div className="space-y-2">
          <p className="text-caption text-fg-tertiary">바뀐 요금제</p>
          <PlanCard
            title={report.changedPlan.planName}
            price={report.changedPlan.monthlyFee ?? 0}
            benefits={toPlanBenefits(report.changedPlan)}
            reason={report.changedPlan.reason}
            context="chat"
            className="w-full"
          />
        </div>
      )}

      {report.otherNotes.importantConditions.length > 0 && (
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
            {report.otherNotes.importantConditions.map((condition, idx) => (
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
    </Card>
  );
}
