import { Database, PhoneCall, Gift } from 'lucide-react';

import { PlanCard } from '@/features/plan-catalog';
import { Card } from '@/features/shared';

export default function ReportDetail() {
  return (
    <div className="px-4 pt-2 pb-10 gap-2 flex flex-col bg-surface-page min-h-full">
      {/* TODO: 실제 상담 리포트 상세 내용 연동 */}
      <Card gap="12" className="relative max-h-45 overflow-y-auto">
        <div className="text-semibold-16-130 text-fg-tertiary">상담 요약</div>

        <div>
          <div className="text-chip flex gap-1.5">
            <div className="font-semibold text-brand-promo-primary shrink-0">
              Q1.
            </div>
            <div>
              현재 사용하고 있는 데이터 사용량은 얼마인가요? 현재 사용하고 있는
              데이터 사용량은 얼마인가요?
            </div>
          </div>

          <div className="text-regular-14-130 text-fg-tertiary mt-0.75 flex gap-1.5">
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
              현재 사용하고 있는 데이터 사용량은 얼마인가요? 현재 사용하고 있는
              데이터 사용량은 얼마인가요?
            </div>
          </div>

          <div className="text-regular-14-130 text-fg-tertiary mt-0.75 flex gap-1.5">
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
              현재 사용하고 있는 데이터 사용량은 얼마인가요? 현재 사용하고 있는
              데이터 사용량은 얼마인가요?
            </div>
          </div>

          <div className="text-regular-14-130 text-fg-tertiary mt-0.75 flex gap-1.5">
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
              현재 사용하고 있는 데이터 사용량은 얼마인가요? 현재 사용하고 있는
              데이터 사용량은 얼마인가요?
            </div>
          </div>

          <div className="text-regular-14-130 text-fg-tertiary mt-0.75 flex gap-1.5">
            <div className="font-semibold">A1.</div>
            <div>5GB ~ 10GB</div>
          </div>
        </div>
      </Card>

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
      />
      {/* <div className="w-full flex gap-2">
        <Button className="w-full" variant="outline">
          비교 하기
        </Button>
        <Button className="w-full">비교 하기</Button>
      </div> */}
    </div>
  );
}
