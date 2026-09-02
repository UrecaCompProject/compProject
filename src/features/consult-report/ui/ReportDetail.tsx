import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { PlanCard, toPlanBenefits } from '@/entities/plan';
import CompareResultSheet from '@/features/plan-compare/ui/CompareResultSheet';
import { Card } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import type { ReportRow } from '../api/getReport';

interface ReportDetailProps {
  report: ReportRow | null;
  onSelectPlan?: (plan: RecommendedPlan) => void;
}

export default function ReportDetail({
  report,
  onSelectPlan,
}: ReportDetailProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // ReportSheet가 report.id를 key로 넘겨 report가 바뀔 때마다 이 컴포넌트를
  // 새로 마운트시키므로, isExpanded/hasOverflow는 report별로 자연히 초기화된다.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    setHasOverflow(card.scrollHeight > card.clientHeight);
  }, []);

  // ReportSheet은 리스트/상세 화면을 언마운트하지 않고 translate-x로만
  // 넘겨서, 상세 화면을 나갔다 다시 들어와도 스크롤 위치가 그대로 남아있다.
  // ReportSheet의 스크롤 컨테이너는 건드리지 않고, 이 화면이 다시 보이는
  // 시점(교차 관찰)을 감지해서 그 스크롤 위치만 맨 위로 되돌린다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scrollParent = root.closest('.overflow-y-auto');
    if (!scrollParent) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          scrollParent.scrollTo({ top: 0 });
        }
      },
      // scrollParent 자신이 translate-x로 움직이는 요소라서, root로 쓰면
      // 로컬 좌표계 기준이라 항상 "보이는" 것으로 계산돼 전환을 못 잡는다.
      // 뷰포트를 기준으로 삼아야 실제로 화면에 들어오는 시점을 감지한다.
      { root: null, threshold: 0.1 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  if (!report) return null;

  const analysis = report.analysis_input;

  return (
    <div
      ref={rootRef}
      className="px-4 pt-4 pb-10 gap-5 flex flex-col bg-surface-page min-h-full"
    >
      <div>
        <div className="text-semibold-16-130 text-fg-tertiary ml-1">
          상담 요약
        </div>
        <div className="relative mt-2">
          <Card
            ref={cardRef}
            gap="12"
            className={`overflow-y-auto transition-[max-height,padding-bottom] duration-300 ${
              !hasOverflow
                ? 'max-h-45 pb-4'
                : isExpanded
                  ? 'max-h-150 pb-8'
                  : 'max-h-45 pb-14'
            }`}
          >
            <p className="text-regular-14-130 text-fg-secondary">
              {report.summary}
            </p>

            {analysis.qaPairs && analysis.qaPairs.length > 0 && (
              <div className="space-y-3 pt-2">
                {analysis.qaPairs.map((pair, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-regular-14-130 font-medium text-fg-primary">
                      Q{idx + 1}. {pair.question}
                    </p>
                    <p className="text-regular-14-130 text-fg-secondary">
                      A{idx + 1}. {pair.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {analysis.importantConditions &&
              analysis.importantConditions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {analysis.importantConditions.map((condition) => (
                    <span
                      key={condition}
                      className="inline-flex items-center rounded-full bg-surface-page px-3 py-1.5 text-caption text-fg-secondary"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              )}
          </Card>

          {hasOverflow && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`absolute inset-x-0 -bottom-px rounded-b-2xl flex items-center justify-center gap-0.5 pb-2 text-[14px] text-fg-tertiary ${
                isExpanded
                  ? 'pt-2 bg-white'
                  : 'bg-linear-to-t from-white from-60% to-transparent pt-8'
              }`}
            >
              {isExpanded ? '접기' : '펼치기'}
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {analysis.recommendedPlanGroups &&
      analysis.recommendedPlanGroups.length > 0 ? (
        // 라운드(target/detail)가 보존된 레포트 — "요금제 추천받기"를 여러 번
        // 요청했으면 그 횟수만큼 그룹이 나뉘어 나온다.
        <div className="flex flex-col gap-6">
          {analysis.recommendedPlanGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-3">
              <div className="ml-1">
                <div className="text-semibold-16-130 text-fg-tertiary">
                  추천 요금제
                  {analysis.recommendedPlanGroups!.length > 1
                    ? ` ${groupIdx + 1}`
                    : ''}
                </div>
                {group.target && (
                  <div className="text-regular-12-130 text-fg-tertiary mt-0.5">
                    {group.detail ? `${group.detail} · ` : ''}
                    {group.target}
                  </div>
                )}
              </div>
              {group.plans.map((plan) => (
                <PlanCard
                  key={plan.planId}
                  className="w-full"
                  title={plan.planName}
                  price={plan.monthlyFee ?? 0}
                  benefits={toPlanBenefits(plan)}
                  reason={plan.reason}
                  onSelect={() => onSelectPlan?.(plan)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        // recommendedPlanGroups가 없는 옛 레포트 — 관계형 조인 결과를 그대로 표시
        report.recommendedPlanDetails &&
        report.recommendedPlanDetails.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-semibold-16-130 text-fg-tertiary ml-1">
              추천 요금제
            </div>
            {report.recommendedPlanDetails.map((plan) => (
              <PlanCard
                key={plan.planId}
                className="w-full"
                title={plan.planName}
                price={plan.monthlyFee ?? 0}
                benefits={toPlanBenefits(plan)}
                reason={plan.reason}
                onSelect={() => onSelectPlan?.(plan)}
              />
            ))}
          </div>
        )
      )}

      {analysis.comparedPlan && (
        <div className="flex flex-col gap-3">
          <div className="text-semibold-16-130 text-fg-tertiary ml-1">
            비교했던 요금제
          </div>
          <CompareResultSheet result={analysis.comparedPlan} />
        </div>
      )}

      {analysis.changedPlan && (
        <div className="flex flex-col gap-3">
          <div className="text-semibold-16-130 text-fg-tertiary ml-1">
            바뀐 요금제
          </div>
          <PlanCard
            className="w-full"
            title={analysis.changedPlan.planName}
            price={analysis.changedPlan.monthlyFee ?? 0}
            benefits={toPlanBenefits(analysis.changedPlan)}
            reason={analysis.changedPlan.reason}
          />
        </div>
      )}
    </div>
  );
}
