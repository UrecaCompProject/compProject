import { useMemo, useState } from 'react';

import { Check, CircleCheck } from 'lucide-react';

import { Button } from '@/features/shared';
import TicketCard from '@/features/shared/components/TicketCard';

import PlanCompareBenefitRow, {
  type BenefitOption,
} from './PlanCompareBenefitRow';
import PlanCompareHeaderSelect, {
  type PlanCompareOption,
} from './PlanCompareHeaderSelect';
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

  benefitRows?: {
    key: string;
    label: string;
    current: string;
    selectedSummary: string;
    selectedSubtext?: string;
    selectedOptions?: BenefitOption[];
  }[];
}

export interface PlanCompareProps {
  data: PlanCompareData;
  /** 기본 '이용중인 요금제'. 상세요금제 화면의 '비교하기'로 들어온 경우처럼
   *  왼쪽 컬럼이 실사용 요금제가 아닐 때 '선택한 요금제' 등으로 바꿔서 사용. */
  currentLabel?: string;
  /** 기본 '선택한 요금제' */
  selectedLabel?: string;
  /** 드롭다운에 띄울 전체 요금제 목록. 없으면 헤더는 화살표 없이 텍스트만 표시. */
  planOptions?: PlanCompareOption[];
  currentPlanId?: string;
  selectedPlanId?: string;
  onSelectCurrentPlan?: (planId: string) => void;
  onSelectSelectedPlan?: (planId: string) => void;
  onDetailCurrent?: () => void;
  onDetailSelected?: () => void;
  onChangePlan?: () => void;
  className?: string;
}

interface SimpleRow {
  key: string;
  label: string;
  current: string;
  selected: string;
}

export default function PlanCompare({
  data,
  currentLabel = '이용중인 요금제',
  selectedLabel = '선택한 요금제',
  planOptions,
  currentPlanId,
  selectedPlanId,
  onSelectCurrentPlan,
  onSelectSelectedPlan,
  onDetailCurrent,
  onDetailSelected,
  onChangePlan,
  className,
}: PlanCompareProps) {
  const [showDiffOnly, setShowDiffOnly] = useState(false);

  const simpleRows: SimpleRow[] = useMemo(
    () => [
      {
        key: 'planName',
        label: '요금제명',
        current: data.currentPlanName,
        selected: data.selectedPlanName,
      },
      {
        key: 'fee',
        label: '월정액',
        current: data.currentFee,
        selected: data.selectedFee,
      },
      {
        key: 'discount',
        label: '할인 상세내역',
        current: data.currentDiscount,
        selected: data.selectedDiscount,
      },
      {
        key: 'data',
        label: '데이터',
        current: data.currentData,
        selected: data.selectedData,
      },
      {
        key: 'tethering',
        label: '테더링',
        current: data.currentTethering,
        selected: data.selectedTethering,
      },
      {
        key: 'shareData',
        label: '데이터 공유',
        current: data.currentShareData,
        selected: data.selectedShareData,
      },
      {
        key: 'voice',
        label: '음성 통화',
        current: data.currentVoice,
        selected: data.selectedVoice,
      },
      {
        key: 'message',
        label: '메세지',
        current: data.currentMessage,
        selected: data.selectedMessage,
      },
    ],
    [data],
  );

  const visibleSimpleRows = showDiffOnly
    ? simpleRows.filter((row) => row.current !== row.selected)
    : simpleRows;

  const benefitRows = data.benefitRows ?? [];
  const visibleBenefitRows = showDiffOnly
    ? benefitRows.filter(
        (row) =>
          row.current !== row.selectedSummary ||
          (row.selectedOptions?.length ?? 0) > 0,
      )
    : benefitRows;

  return (
    <div className={`flex w-[358px] flex-col gap-3 ${className ?? ''}`}>
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

      <TicketCard>
        {/* 헤더 */}
        <div className="grid grid-cols-2 gap-4 pb-3">
          <PlanCompareHeaderSelect
            label={currentLabel}
            options={planOptions}
            activeId={currentPlanId}
            onSelect={onSelectCurrentPlan}
            colorClassName="text-fg-primary"
          />
          <PlanCompareHeaderSelect
            label={selectedLabel}
            options={planOptions}
            activeId={selectedPlanId}
            onSelect={onSelectSelectedPlan}
            colorClassName="text-reward-active"
          />
        </div>
        <div className="border-b border-fg-primary" />

        {visibleSimpleRows.map((row) => (
          <PlanCompareRow
            key={row.key}
            label={row.label}
            current={row.current}
            selected={row.selected}
          />
        ))}

        {visibleBenefitRows.map((row) => (
          <PlanCompareBenefitRow
            key={row.key}
            label={row.label}
            current={row.current}
            selectedSummary={row.selectedSummary}
            selectedSubtext={row.selectedSubtext}
            selectedOptions={row.selectedOptions}
          />
        ))}

        {visibleSimpleRows.length === 0 && visibleBenefitRows.length === 0 && (
          <p className="py-6 text-center text-[13px] text-fg-tertiary">
            차이가 있는 항목이 없어요.
          </p>
        )}

        {/* 상세보기 링크 / 안내 문구 / 변경 버튼 — 16px 간격 고정 */}
        <div className="flex flex-col gap-4 pt-3">
          <div className="grid grid-cols-2 gap-4">
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

          <p className="text-[10px] font-normal text-fg-disabled">
            · 요금제를 낮추면 혜택이 달라질 수 있습니다.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={onChangePlan}
          >
            요금제 변경하기
          </Button>
        </div>
      </TicketCard>
    </div>
  );
}
