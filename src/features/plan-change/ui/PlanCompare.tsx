import { useMemo, useState } from 'react';

import { Check, CircleCheck } from 'lucide-react';

import { Button } from '@/shared';
import TicketCard from '@/shared/ui/TicketCard';

import PlanCompareBenefitListRow from './PlanCompareBenefitListRow';
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
  /** 대표 혜택 불릿 목록 */
  currentBenefits?: string[];

  selectedPlanName: string;
  selectedFee: string;
  selectedDiscount: string;
  selectedData: string;
  selectedTethering: string;
  selectedShareData: string;
  selectedVoice: string;
  selectedMessage: string;
  selectedBenefits?: string[];

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
  /** 'compact' = 챗봇 인라인 요약 카드, 'full' = 상세 바텀시트 */
  variant?: 'compact' | 'full';
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
  /** 사용자가 실제 이용 중인 요금제 id. 드롭다운 목록에서 '현재'로 표시한다. */
  myPlanId?: string;
  /** 왼쪽 컬럼이 실제 내 요금제가 아니라 드롭다운으로 바꾼 요금제일 때
   *  타이틀을 '선택한 요금제'로, 색을 남색으로 바꾼다. */
  currentHighlighted?: boolean;
  /** 오른쪽(선택한 요금제) 컬럼이 이미 내가 이용 중인 요금제일 때.
   *  '요금제 변경하기'를 비활성화하고 안내 문구를 바꾼다. */
  selectedIsMine?: boolean;
  onDetailCurrent?: () => void;
  onDetailSelected?: () => void;
  onChangePlan?: () => void;
  /** compact 카드의 '전체 비교 보기' 버튼 */
  onShowFullCompare?: () => void;
  className?: string;
}

interface SimpleRow {
  key: string;
  label: string;
  current: string;
  selected: string;
}

const COMPACT_ROW_KEYS_BEFORE_BENEFIT = ['planName', 'fee', 'data'];
const COMPACT_ROW_KEYS_AFTER_BENEFIT = ['voice', 'message'];

export default function PlanCompare({
  data,
  variant = 'full',
  currentLabel = '이용중인 요금제',
  selectedLabel = '선택한 요금제',
  planOptions,
  currentPlanId,
  selectedPlanId,
  onSelectCurrentPlan,
  onSelectSelectedPlan,
  myPlanId,
  currentHighlighted = false,
  selectedIsMine = false,
  onDetailCurrent,
  onDetailSelected,
  onChangePlan,
  onShowFullCompare,
  className,
}: PlanCompareProps) {
  const isCompact = variant === 'compact';
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

  const currentBenefits = data.currentBenefits ?? [];
  const selectedBenefits = data.selectedBenefits ?? [];

  // 왼쪽 컬럼을 드롭다운으로 내 요금제가 아닌 다른 요금제로 바꾸면
  // 타이틀은 '선택한 요금제'로, 색은 오른쪽과 같은 남색으로 바뀐다.
  const leftLabel = currentHighlighted ? selectedLabel : currentLabel;
  const leftColorClass = currentHighlighted
    ? 'text-compare-selected-strong'
    : 'text-fg-primary';

  const renderHeader = () => (
    <div className="grid grid-cols-2 gap-4 pb-3">
      <PlanCompareHeaderSelect
        label={leftLabel}
        options={planOptions}
        activeId={currentPlanId}
        onSelect={onSelectCurrentPlan}
        myPlanId={myPlanId}
        colorClassName={leftColorClass}
      />
      <PlanCompareHeaderSelect
        label={selectedLabel}
        options={planOptions}
        activeId={selectedPlanId}
        onSelect={onSelectSelectedPlan}
        myPlanId={myPlanId}
        colorClassName="text-compare-selected-strong"
      />
    </div>
  );

  // compact: 요금제명 / 월정액 / 데이터 / 대표 혜택 / 음성 통화 / 메세지만 노출
  if (isCompact) {
    const rowsBefore = simpleRows.filter((row) =>
      COMPACT_ROW_KEYS_BEFORE_BENEFIT.includes(row.key),
    );
    const rowsAfter = simpleRows.filter((row) =>
      COMPACT_ROW_KEYS_AFTER_BENEFIT.includes(row.key),
    );

    return (
      <div className={`flex flex-col ${className ?? 'w-[358px]'}`}>
        <TicketCard>
          {renderHeader()}
          <div className="border-b border-fg-primary" />

          {rowsBefore.map((row) => (
            <PlanCompareRow
              key={row.key}
              label={row.label}
              current={row.current}
              selected={row.selected}
              currentHighlighted={currentHighlighted}
            />
          ))}

          <PlanCompareBenefitListRow
            label="대표 혜택"
            current={currentBenefits}
            selected={selectedBenefits}
            currentHighlighted={currentHighlighted}
          />

          {rowsAfter.map((row) => (
            <PlanCompareRow
              key={row.key}
              label={row.label}
              current={row.current}
              selected={row.selected}
              currentHighlighted={currentHighlighted}
            />
          ))}

          <div className="mt-4">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={onShowFullCompare}
            >
              전체 비교 보기
            </Button>
          </div>
        </TicketCard>
      </div>
    );
  }

  // 차이점만 보기에서도 요금제명 행은 항상 남긴다(어느 요금제끼리 비교인지 알 수 있도록).
  const visibleSimpleRows = showDiffOnly
    ? simpleRows.filter(
        (row) => row.key === 'planName' || row.current !== row.selected,
      )
    : simpleRows;

  const benefitRows = data.benefitRows ?? [];
  const visibleBenefitRows = showDiffOnly
    ? benefitRows.filter(
        (row) =>
          row.current !== row.selectedSummary ||
          (row.selectedOptions?.length ?? 0) > 0,
      )
    : benefitRows;

  const showBenefitListRow =
    !showDiffOnly || currentBenefits.join('|') !== selectedBenefits.join('|');

  // 요금제명 외에 실제로 다른 항목이 하나도 없을 때 안내 문구를 띄운다.
  const noDifferences =
    showDiffOnly &&
    visibleBenefitRows.length === 0 &&
    !showBenefitListRow &&
    visibleSimpleRows.every(
      (row) => row.key === 'planName' || row.current === row.selected,
    );

  return (
    <div className={`flex flex-col pt-4 ${className ?? 'w-[358px]'}`}>
      <button
        type="button"
        onClick={() => setShowDiffOnly((prev) => !prev)}
        className="group mb-4 flex cursor-pointer items-center gap-1.5 text-[16px] font-semibold text-fg-primary"
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

      {/* 헤더 */}
      {renderHeader()}
      <div className="border-b border-fg-primary" />

      {visibleSimpleRows.map((row) => (
        <PlanCompareRow
          key={row.key}
          label={row.label}
          current={row.current}
          selected={row.selected}
          currentHighlighted={currentHighlighted}
        />
      ))}

      {showBenefitListRow && (
        <PlanCompareBenefitListRow
          label="대표 혜택"
          current={currentBenefits}
          selected={selectedBenefits}
          currentHighlighted={currentHighlighted}
        />
      )}

      {visibleBenefitRows.map((row) => (
        <PlanCompareBenefitRow
          key={row.key}
          label={row.label}
          current={row.current}
          selectedSummary={row.selectedSummary}
          selectedSubtext={row.selectedSubtext}
          selectedOptions={row.selectedOptions}
          currentHighlighted={currentHighlighted}
        />
      ))}

      {noDifferences && (
        <p className="py-6 text-center text-[13px] text-fg-tertiary">
          차이가 있는 항목이 없어요.
        </p>
      )}

      {/* 상세보기 링크 / 안내 문구 / 변경 버튼 — 16px 간격 고정 */}
      <div className="flex flex-col gap-4 pt-3">
        {(onDetailCurrent || onDetailSelected) && (
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
              className="text-left text-[13px] font-medium text-compare-selected-strong"
            >
              요금제 상세보기 &gt;
            </button>
          </div>
        )}

        <p
          className={`text-[12px] ${
            selectedIsMine
              ? 'font-medium text-fg-secondary'
              : 'font-normal text-fg-tertiary'
          }`}
        >
          {selectedIsMine
            ? '· 현재 이용 중인 요금제예요. 다른 요금제를 선택해 비교해 보세요.'
            : '· 요금제를 낮추면 혜택이 달라질 수 있습니다.'}
        </p>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onChangePlan}
          disabled={selectedIsMine || !onChangePlan}
        >
          요금제 변경하기
        </Button>
      </div>
    </div>
  );
}
