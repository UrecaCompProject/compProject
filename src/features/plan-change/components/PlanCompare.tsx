import { useState } from 'react';

import { Check, CircleCheck } from 'lucide-react';

import { Button } from '@/features/shared';
import TicketCard from '@/features/shared/components/TicketCard';

import PlanCompareRow from './PlanCompareRow';

export interface PlanCompareData {
  currentPlanName: string;
  currentFee: string;
  currentDiscount: string;
  currentData: string;
  currentTethering: string;
  currentShareData: string;
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
  onChangePlan?: () => void;
}

export default function PlanCompare({
  data,
  onDetailCurrent,
  onDetailSelected,
  onChangePlan,
}: PlanCompareProps) {
  const [showDiffOnly, setShowDiffOnly] = useState(false);

  return (
    <div className="flex w-[358px] flex-col gap-3">
      <button
        type="button"
        onClick={() => setShowDiffOnly((prev) => !prev)}
        className="group flex cursor-pointer items-center gap-1.5 text-[16px] font-semibold text-fg-primary"
      >
        {showDiffOnly ? (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-promo-primary">
            <Check size={13} strokeWidth={3} className="text-white" />
          </span>
        ) : (
          <CircleCheck
            size={20}
            className="text-fg-tertiary group-hover:text-brand-promo-primary"
          />
        )}
        차이점만 모아보기
      </button>

      <TicketCard radius={6} gap={10} startOffset={8}>
        {/* 헤더 */}
        <div className="grid grid-cols-2 gap-4 pb-3">
          <p className="text-left text-[14px] font-semibold text-fg-primary">
            이용중인 요금제
          </p>
          <p className="text-left text-[14px] font-semibold text-reward-active">
            선택한 요금제
          </p>
        </div>
        <div className="border-b border-fg-primary" />

        <PlanCompareRow
          label="요금제명"
          current={data.currentPlanName}
          selected={data.selectedPlanName}
        />
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

        {/* 상세보기 링크 */}
        <div className="grid grid-cols-2 gap-4 pt-3">
          <button
            type="button"
            onClick={onDetailCurrent}
            className="text-left text-[13px] font-medium text-fg-tertiary"
          >
            요금제 상세보기 &gt;
          </button>
          <button
            type="button"
            onClick={onDetailSelected}
            className="text-left text-[13px] font-medium text-reward-active"
          >
            요금제 상세보기 &gt;
          </button>
        </div>

        <p className="pt-3 text-[10px] font-normal text-fg-disabled">
          · 요금제를 낮추면 혜택이 달라질 수 있습니다.
        </p>

        <Button
          variant="primary"
          size="lg"
          className="w-full mt-4"
          onClick={onChangePlan}
        >
          요금제 변경하기
        </Button>
      </TicketCard>
    </div>
  );
}
