import { ChevronDown } from 'lucide-react';

import { Button, Card, Line } from '@/features/shared';

import PlanCompareRow from './PlanCompareRow';

// 임시 타입 — plan.ts 확정 전까지 로컬 props로 처리
export interface PlanCompareData {
  currentPlanName: string;
  currentFee: string;
  currentDiscount: string;
  currentData: string;
  currentTethering: string;
  currentShareData: string;
  currentBenefit: string;
  currentVoice: string;
  currentMessage: string;

  selectedPlanName: string;
  selectedFee: string;
  selectedDiscount: string;
  selectedData: string;
  selectedTethering: string;
  selectedShareData: string;
  selectedVoice: string;
  selectedMessage: string;
}

export interface PlanCompareProps {
  data: PlanCompareData;
  onDetailCurrent?: () => void;
  onDetailSelected?: () => void;
}

export default function PlanCompare({
  data,
  onDetailCurrent,
  onDetailSelected,
}: PlanCompareProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="flex items-center gap-1.5 text-[14px] font-semibold text-fg-primary"
      >
        <ChevronDown size={18} />
        차이점만 모아보기
      </button>

      <Card border="default" shadow gap="0">
        {/* 헤더 */}
        <div className="grid grid-cols-2 gap-4 pb-3">
          <p className="text-[14px] font-semibold text-fg-primary">
            이용중인 요금제
          </p>
          <p className="text-[14px] font-semibold text-compare-selected">
            선택한 요금제
          </p>
        </div>
        <Line />

        <PlanCompareRow
          label="요금제명"
          current={data.currentPlanName}
          selected={data.selectedPlanName}
        />
        <Line />

        <PlanCompareRow
          label="월정액"
          current={data.currentFee}
          selected={data.selectedFee}
        />
        <PlanCompareRow
          label="할인 상세내역"
          current={data.currentDiscount}
          selected={data.selectedDiscount}
        />
        <Line />

        <PlanCompareRow
          label="데이터"
          current={data.currentData}
          selected={data.selectedData}
        />
        <PlanCompareRow
          label="테더링"
          current={data.currentTethering}
          selected={data.selectedTethering}
        />
        <PlanCompareRow
          label="데이터 공유"
          current={data.currentShareData}
          selected={data.selectedShareData}
        />
        <Line />

        <PlanCompareRow
          label="음성 통화"
          current={data.currentVoice}
          selected={data.selectedVoice}
        />
        <PlanCompareRow
          label="메세지"
          current={data.currentMessage}
          selected={data.selectedMessage}
        />
        <Line />

        {/* 상세보기 링크 */}
        <div className="grid grid-cols-2 gap-4 pt-3">
          <button
            type="button"
            onClick={onDetailCurrent}
            className="text-[13px] font-medium text-fg-tertiary"
          >
            요금제 상세보기 &gt;
          </button>
          <button
            type="button"
            onClick={onDetailSelected}
            className="text-[13px] font-medium text-compare-selected"
          >
            요금제 상세보기 &gt;
          </button>
        </div>

        <p className="pt-3 text-[12px] text-fg-tertiary">
          · 요금제를 낮추면 혜택이 달라질 수 있습니다.
        </p>
      </Card>

      <Button variant="primary" size="lg" className="w-full">
        요금제 신청하기
      </Button>
    </div>
  );
}
