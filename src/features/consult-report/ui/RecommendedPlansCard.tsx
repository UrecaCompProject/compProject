import type { ComponentType } from 'react';
import { useState } from 'react';

import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';

import { Card, Button, Line } from '@/shared';
import type {
  RecommendedPlan,
  RecommendedPlanGroup,
} from '@/shared/lib/aiConsult';
import type { PlanDetailItem } from '@/shared/types/plan';

import { buildRoundLabel, clusterByGroupId } from '../lib/reportDetailHelpers';

interface PlanDetailContentProps {
  plan: PlanDetailItem | null;
  isLoading: boolean;
  error: string | null;
}

interface RecommendedPlansCardProps {
  groups: RecommendedPlanGroup[];
  onSelectPlan?: (plan: RecommendedPlan) => void;
  PlanDetailContent: ComponentType<PlanDetailContentProps>;
  PlanDetailSheet: ComponentType<{
    plan: RecommendedPlan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubscribe: (plan: RecommendedPlan) => void;
    PlanDetailContent: ComponentType<PlanDetailContentProps>;
  }>;
}

export default function RecommendedPlansCard({
  groups,
  onSelectPlan,
  PlanDetailContent,
  PlanDetailSheet,
}: RecommendedPlansCardProps) {
  const [isPlansOpen, setIsPlansOpen] = useState(true);
  // 요금제 행을 누르면 이 값이 채워지고 상세 정보 시트가 열린다.
  const [detailPlan, setDetailPlan] = useState<RecommendedPlan | null>(null);
  // 라운드별 요금제 리스트 접힘 상태 — groupId-roundIdx를 키로 접힌 라운드만 담는다
  // (기본은 전부 펼침).
  const [collapsedRounds, setCollapsedRounds] = useState<Set<string>>(
    new Set(),
  );
  const toggleRound = (key: string) => {
    setCollapsedRounds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clusters = clusterByGroupId(groups);

  return (
    <>
      <Card radius="none" gap="16" className="px-4 py-5">
        {/* Card의 gap이 헤더/본문 사이에도 고정 간격을 붙여버려서, 접었을 때도
          빈 여백이 남는다. 이 섹션 전체를 Card의 자식 하나로 묶고, 헤더와
          본문 사이 간격은 접힘 상태에 따라 직접 열고 닫는다. */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-bold-16-140">추천 요금제</span>
            <button
              type="button"
              onClick={() => setIsPlansOpen((prev) => !prev)}
              aria-label={
                isPlansOpen ? '추천 요금제 접기' : '추천 요금제 펼치기'
              }
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-fg-tertiary transition-colors hover:bg-surface-page hover:text-fg-secondary"
            >
              {isPlansOpen ? (
                <ChevronUp size={20} className="text-fg-secondary" />
              ) : (
                <ChevronDown size={20} className="text-fg-secondary" />
              )}
            </button>
          </div>

          <div
            className={`grid transition-all duration-300 ease-out ${
              isPlansOpen
                ? 'grid-rows-[1fr] opacity-100 mt-4'
                : 'grid-rows-[0fr] opacity-0 mt-0'
            }`}
          >
            <div className="overflow-hidden flex flex-col gap-4">
              {clusters.map((cluster, clusterIdx) => (
                <div
                  key={cluster[0].groupId}
                  className={`flex flex-col gap-4 ${
                    clusterIdx > 0 ? 'border-t border-border pt-4' : ''
                  }`}
                >
                  <div className="flex flex-wrap gap-2">
                    {cluster[0].target
                      .split(' / ')
                      .filter(Boolean)
                      .map((t, idx) => (
                        <Button
                          variant="chip"
                          size="chip"
                          disabled
                          key={idx}
                          className="hover:bg-white! hover:text-fg-tertiary! hover:border-border!"
                        >
                          {t}
                        </Button>
                      ))}
                  </div>
                  <div className="flex flex-col">
                    {cluster.map((group, roundIdx) => {
                      const label = buildRoundLabel(cluster, roundIdx);
                      const roundKey = `${group.groupId}-${roundIdx}`;
                      const isRoundOpen = !collapsedRounds.has(roundKey);
                      return (
                        <div key={roundIdx} className="flex gap-2">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                roundIdx === 0
                                  ? 'bg-brand-promo-primary text-white'
                                  : 'border border-border bg-white text-fg-tertiary'
                              }`}
                            >
                              {roundIdx + 1}
                            </span>
                            {roundIdx < cluster.length - 1 && (
                              <span className="w-px flex-1 bg-border my-1" />
                            )}
                          </div>
                          <div className="flex flex-1 flex-col gap-3 pb-5">
                            <button
                              type="button"
                              onClick={() => toggleRound(roundKey)}
                              aria-label={
                                isRoundOpen
                                  ? '요금제 리스트 접기'
                                  : '요금제 리스트 펼치기'
                              }
                              className="flex items-center gap-1"
                            >
                              <span className="min-w-0 wrap-normal break-keep font-semibold text-[14px] text-fg-primary">
                                {label}
                              </span>
                              {isRoundOpen ? (
                                <ChevronUp
                                  size={16}
                                  className="shrink-0 text-fg-tertiary"
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                  className="shrink-0 text-fg-tertiary"
                                />
                              )}
                            </button>
                            <div
                              className={`grid transition-all duration-300 ease-out ${
                                isRoundOpen
                                  ? 'grid-rows-[1fr] opacity-100'
                                  : 'grid-rows-[0fr] opacity-0'
                              }`}
                            >
                              <div className="overflow-hidden">
                                <div className="flex flex-col border border-border rounded-2xl p-4 gap-3">
                                  {group.plans.map((p, planIdx) => (
                                    <div key={p.planId} className="contents">
                                      {planIdx > 0 && <Line />}
                                      <button
                                        type="button"
                                        onClick={() => setDetailPlan(p)}
                                        className="w-full flex justify-between items-center gap-2"
                                      >
                                        <div className="min-w-0 wrap-normal break-keep text-[14px] font-medium">
                                          {p.planName}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1 text-[14px] text-fg-tertiary">
                                          월
                                          <span className="w-15 inline-block ml-0.5 font-medium">
                                            {p.monthlyFee?.toLocaleString(
                                              'ko-KR',
                                            )}{' '}
                                            원
                                          </span>
                                          <ChevronRight size={16} />
                                        </div>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <PlanDetailSheet
        plan={detailPlan}
        open={!!detailPlan}
        onOpenChange={(open) => {
          if (!open) setDetailPlan(null);
        }}
        onSubscribe={(plan) => {
          setDetailPlan(null);
          onSelectPlan?.(plan);
        }}
        PlanDetailContent={PlanDetailContent}
      />
    </>
  );
}
