import { useLayoutEffect, useRef, useState } from 'react';

import {
  ChevronDown,
  ChevronUp,
  Database,
  PhoneCall,
  Gift,
} from 'lucide-react';

import { PlanCard } from '@/features/plan-catalog';
import { Card } from '@/features/shared';
import type { RecommendedPlan } from '@/lib/aiConsult';

interface ReportDetailProps {
  onSelectPlan?: (plan: RecommendedPlan) => void;
}

export default function ReportDetail({ onSelectPlan }: ReportDetailProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    setHasOverflow(card.scrollHeight > card.clientHeight);
  }, []);

  return (
    <div className="px-4 pt-4 pb-10 gap-5 flex flex-col bg-surface-page min-h-full">
      {/* TODO: 실제 상담 리포트 상세 내용 연동 */}
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
            <div>
              <div className="text-chip flex gap-1.5">
                <div className="font-semibold text-brand-promo-primary shrink-0">
                  Q1.
                </div>
                <div>
                  현재 사용하고 있는 데이터 사용량은 얼마인가요? 현재 사용하고
                  있는 데이터 사용량은 얼마인가요?
                </div>
              </div>

              <div className="text-regular-14-130 text-fg-tertiary mt-0.5 flex gap-1.5">
                <div className="font-semibold">A1.</div>
                <div>5GB ~ 10GB</div>
              </div>
            </div>

            <div>
              <div className="text-chip flex gap-1.5">
                <div className="font-semibold text-brand-promo-primary shrink-0">
                  Q1.
                </div>
                <div>
                  현재 사용하고 있는 데이터 사용량은 얼마인가요? 현재 사용하고
                  있는 데이터 사용량은 얼마인가요?
                </div>
              </div>

              <div className="text-regular-14-130 text-fg-tertiary mt-0.5 flex gap-1.5">
                <div className="font-semibold">A1.</div>
                <div>5GB ~ 10GB</div>
              </div>
            </div>

            <div>
              <div className="text-chip flex gap-1.5">
                <div className="font-semibold text-brand-promo-primary shrink-0">
                  Q1.
                </div>
                <div>
                  현재 사용하고 있는 데이터 사용량은 얼마인가요? 현재 사용하고
                  있는 데이터 사용량은 얼마인가요?
                </div>
              </div>

              <div className="text-regular-14-130 text-fg-tertiary mt-0.5 flex gap-1.5">
                <div className="font-semibold">A1.</div>
                <div>5GB ~ 10GB</div>
              </div>
            </div>

            <div>
              <div className="text-chip flex gap-1.5">
                <div className="font-semibold text-brand-promo-primary shrink-0">
                  Q1.
                </div>
                <div>
                  현재 사용하고 있는 데이터 사용량은 얼마인가요? 현재 사용하고
                  있는 데이터 사용량은 얼마인가요?
                </div>
              </div>

              <div className="text-regular-14-130 text-fg-tertiary mt-0.5 flex gap-1.5">
                <div className="font-semibold">A1.</div>
                <div>5GB ~ 10GB</div>
              </div>
            </div>
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

      <div className="flex flex-col gap-3">
        <div className="text-semibold-16-130 text-fg-tertiary ml-1">
          추천 요금제
        </div>
        <PlanCard
          className="w-full"
          title="추천 요금제"
          price={50000}
          benefits={[
            { icon: Database, label: '5G 데이터 20GB + 3G 무제한' },
            { icon: PhoneCall, label: '통화·문제 무제한' },
            { icon: Gift, label: '넷플릭스 스탠다드, U+ VIP 등급' },
          ]}
          reason="현재 사용량과 비교했을 때 가장 적합한 요금제입니다."
          onSelect={() =>
            onSelectPlan?.({
              planId: '1',
              planName: '추천 요금제',
              reason: '현재 사용량과 비교했을 때 가장 적합한 요금제입니다.',
              savingAmount: 0,
              monthlyFee: 50000,
            })
          }
        />

        <PlanCard
          className="w-full"
          title="추천 요금제"
          price={50000}
          benefits={[
            { icon: Database, label: '5G 데이터 20GB + 3G 무제한' },
            { icon: PhoneCall, label: '통화·문제 무제한' },
            { icon: Gift, label: '넷플릭스 스탠다드, U+ VIP 등급' },
          ]}
          reason="현재 사용량과 비교했을 때 가장 적합한 요금제입니다."
          onSelect={() =>
            onSelectPlan?.({
              planId: '2',
              planName: '추천 요금제',
              reason: '현재 사용량과 비교했을 때 가장 적합한 요금제입니다.',
              savingAmount: 0,
              monthlyFee: 50000,
            })
          }
        />

        <PlanCard
          className="w-full"
          title="추천 요금제"
          price={50000}
          benefits={[
            { icon: Database, label: '5G 데이터 20GB + 3G 무제한' },
            { icon: PhoneCall, label: '통화·문제 무제한' },
            { icon: Gift, label: '넷플릭스 스탠다드, U+ VIP 등급' },
          ]}
          reason="현재 사용량과 비교했을 때 가장 적합한 요금제입니다."
          onSelect={() =>
            onSelectPlan?.({
              planId: '3',
              planName: '추천 요금제',
              reason: '현재 사용량과 비교했을 때 가장 적합한 요금제입니다.',
              savingAmount: 0,
              monthlyFee: 50000,
            })
          }
        />
      </div>
      {/* <div className="w-full flex gap-2">
        <Button className="w-full" variant="outline">
          비교 하기
        </Button>
        <Button className="w-full">비교 하기</Button>
      </div> */}
    </div>
  );
}
