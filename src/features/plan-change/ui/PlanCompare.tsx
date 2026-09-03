import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Check, CircleCheck } from 'lucide-react';

import { Button } from '@/shared';
import type { PlanCompareData } from '@/shared/types/plan';
import TicketCard from '@/shared/ui/TicketCard';

import PlanCompareBenefitListRow from './PlanCompareBenefitListRow';
import PlanCompareBenefitRow from './PlanCompareBenefitRow';
import PlanCompareRow from './PlanCompareRow';
import PlanCompareSelect, { type PlanCompareOption } from './PlanCompareSelect';

export type { PlanCompareData };

export interface PlanCompareProps {
  data: PlanCompareData;
  /** 'compact' = 챗봇 인라인 요약 카드, 'full' = 상세 바텀시트 */
  variant?: 'compact' | 'full';
  /** 'fix'면 두 컬럼 모두 '선택한 요금제' 스타일로 고정 표시하고, planOptions를
   *  넘겨도 드롭다운 없이 텍스트로만 보여줘 값을 바꿀 수 없게 한다. */
  type?: 'default' | 'fix';
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

/**
 * '차이점만 모아보기' 토글 시 행이 부드럽게 접히고 펼쳐지도록
 * grid-template-rows(0fr↔1fr) 트랜지션으로 높이를 애니메이션한다.
 */
function CollapsibleRow({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

export default function PlanCompare({
  data,
  variant = 'full',
  type = 'default',
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
  const isFixed = type === 'fix';
  // 'fix'면 왼쪽 컬럼도 오른쪽과 같은 '선택한 요금제' 스타일로 고정한다.
  const effectiveCurrentHighlighted = isFixed || currentHighlighted;
  const [showDiffOnly, setShowDiffOnly] = useState(false);

  // 요금제 드롭다운 — 헤더 라벨과 요금제명 행이 같은 드롭다운을 연다.
  // 'fix'면 planOptions를 넘겨받아도 드롭다운을 아예 열지 않는다.
  const hasOptions = !isFixed && (planOptions?.length ?? 0) > 0;
  const [openColumn, setOpenColumn] = useState<'current' | 'selected' | null>(
    null,
  );
  const toggleColumn = (column: 'current' | 'selected') =>
    setOpenColumn((prev) => (prev === column ? null : column));
  const closeDropdown = () => setOpenColumn(null);

  useEffect(() => {
    if (!openColumn) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('[data-compare-select]')) {
        setOpenColumn(null);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [openColumn]);

  // 요금제명 행이 스크롤로 상단에 '고정'됐을 때만 border-bottom을 표시
  const planNameStickyRef = useRef<HTMLDivElement>(null);
  const [planNameStuck, setPlanNameStuck] = useState(false);
  useEffect(() => {
    const el = planNameStickyRef.current;
    if (!el) return;
    const root = el.closest('.overflow-y-auto') ?? null;
    const observer = new IntersectionObserver(
      ([entry]) => setPlanNameStuck(entry.intersectionRatio < 1),
      { root, threshold: [1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
  const leftLabel = effectiveCurrentHighlighted ? selectedLabel : currentLabel;
  const leftColorClass = effectiveCurrentHighlighted
    ? 'text-compare-selected-strong'
    : 'text-fg-primary';

  const currentValueColor = effectiveCurrentHighlighted
    ? 'text-compare-selected-strong'
    : 'text-fg-tertiary';

  // 헤더는 라벨만 — 드롭다운은 요금제명 행의 셀렉트 박스에서 연다.
  const renderHeader = () => (
    <div className="grid grid-cols-2 gap-4 pb-3">
      <span className={`text-[16px] font-semibold ${leftColorClass}`}>
        {leftLabel}
      </span>
      <span className="text-[16px] font-semibold text-compare-selected-strong">
        {selectedLabel}
      </span>
    </div>
  );

  // 첫 행(요금제명) — hasOptions면 값 자리에 셀렉트 박스를 놓아 바로 아래에 드롭다운을 연다.
  const renderPlanNameRow = () => (
    <div className="grid grid-cols-2 gap-4 py-3">
      <div className="flex flex-col gap-1">
        <p className={`text-[12px] font-medium ${currentValueColor}`}>
          요금제명
        </p>
        {hasOptions ? (
          <PlanCompareSelect
            value={data.currentPlanName}
            options={planOptions ?? []}
            activeId={currentPlanId}
            myPlanId={myPlanId}
            open={openColumn === 'current'}
            onToggle={() => toggleColumn('current')}
            onClose={closeDropdown}
            onSelect={onSelectCurrentPlan}
            colorClassName={currentValueColor}
          />
        ) : (
          <p className={`text-[14px] font-bold ${currentValueColor}`}>
            {data.currentPlanName}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-medium text-compare-selected-strong">
          요금제명
        </p>
        {hasOptions ? (
          <PlanCompareSelect
            value={data.selectedPlanName}
            options={planOptions ?? []}
            activeId={selectedPlanId}
            myPlanId={myPlanId}
            open={openColumn === 'selected'}
            onToggle={() => toggleColumn('selected')}
            onClose={closeDropdown}
            onSelect={onSelectSelectedPlan}
            colorClassName="text-compare-selected-strong"
          />
        ) : (
          <p className="text-[14px] font-bold text-compare-selected-strong">
            {data.selectedPlanName}
          </p>
        )}
      </div>
    </div>
  );

  // compact: 요금제명 / 월정액 / 데이터 / 대표 혜택 / 음성 통화 / 메세지만 노출
  if (isCompact) {
    const rowsBefore = simpleRows.filter(
      (row) =>
        row.key !== 'planName' &&
        COMPACT_ROW_KEYS_BEFORE_BENEFIT.includes(row.key),
    );
    const rowsAfter = simpleRows.filter((row) =>
      COMPACT_ROW_KEYS_AFTER_BENEFIT.includes(row.key),
    );

    return (
      <div className={`flex flex-col px-4 pt-2 ${className ?? 'w-[358px]'}`}>
        <TicketCard>
          {renderHeader()}
          <div className="border-b border-fg-primary" />

          {renderPlanNameRow()}

          {rowsBefore.map((row) => (
            <PlanCompareRow
              key={row.key}
              label={row.label}
              current={row.current}
              selected={row.selected}
              currentHighlighted={effectiveCurrentHighlighted}
            />
          ))}

          <PlanCompareBenefitListRow
            label="대표 혜택"
            current={currentBenefits}
            selected={selectedBenefits}
            currentHighlighted={effectiveCurrentHighlighted}
          />

          {rowsAfter.map((row) => (
            <PlanCompareRow
              key={row.key}
              label={row.label}
              current={row.current}
              selected={row.selected}
              currentHighlighted={effectiveCurrentHighlighted}
            />
          ))}

          {onShowFullCompare && (
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
          )}
        </TicketCard>
      </div>
    );
  }

  const benefitRows = data.benefitRows ?? [];

  const isSimpleRowVisible = (row: SimpleRow) =>
    !showDiffOnly || row.key === 'planName' || row.current !== row.selected;
  const isBenefitRowVisible = (row: (typeof benefitRows)[number]) =>
    !showDiffOnly ||
    row.current !== row.selectedSummary ||
    (row.selectedOptions?.length ?? 0) > 0;

  const showBenefitListRow =
    !showDiffOnly || currentBenefits.join('|') !== selectedBenefits.join('|');

  // 요금제명 외에 실제로 다른 항목이 하나도 없을 때 안내 문구를 띄운다.
  const noDifferences =
    showDiffOnly &&
    !showBenefitListRow &&
    benefitRows.every((row) => !isBenefitRowVisible(row)) &&
    simpleRows.every(
      (row) => row.key === 'planName' || row.current === row.selected,
    );

  return (
    <div
      className={`flex min-h-full flex-col pt-4 ${className ?? 'w-[358px]'}`}
    >
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

      {/* 요금제명(비교 중인 두 요금제) 행은 스크롤해도 상단에 고정.
          border-bottom은 실제로 고정됐을 때만 표시 */}
      <div
        ref={planNameStickyRef}
        className={`sticky -top-px z-10 border-b bg-surface-card transition-colors duration-200 ${
          planNameStuck ? 'border-border' : 'border-transparent'
        }`}
      >
        {renderPlanNameRow()}
      </div>

      {simpleRows.slice(1).map((row) => (
        <CollapsibleRow key={row.key} open={isSimpleRowVisible(row)}>
          <PlanCompareRow
            label={row.label}
            current={row.current}
            selected={row.selected}
            currentHighlighted={effectiveCurrentHighlighted}
          />
        </CollapsibleRow>
      ))}

      <CollapsibleRow open={showBenefitListRow}>
        <PlanCompareBenefitListRow
          label="대표 혜택"
          current={currentBenefits}
          selected={selectedBenefits}
          currentHighlighted={effectiveCurrentHighlighted}
        />
      </CollapsibleRow>

      {benefitRows.map((row) => (
        <CollapsibleRow key={row.key} open={isBenefitRowVisible(row)}>
          <PlanCompareBenefitRow
            label={row.label}
            current={row.current}
            selectedSummary={row.selectedSummary}
            selectedSubtext={row.selectedSubtext}
            selectedOptions={row.selectedOptions}
            currentHighlighted={effectiveCurrentHighlighted}
          />
        </CollapsibleRow>
      ))}

      <CollapsibleRow open={noDifferences}>
        <p className="py-6 text-center text-[13px] text-fg-tertiary">
          차이가 있는 항목이 없어요.
        </p>
      </CollapsibleRow>

      {/* 상세보기 링크 / 안내 문구 / 변경 버튼 —
          행이 길어져 스크롤이 생겨도 시트 하단에 고정(sticky) */}
      <div className="sticky bottom-0 mt-auto flex flex-col gap-4 border-t border-border bg-surface-card pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        {(onDetailCurrent || onDetailSelected) && (
          <div className="grid grid-cols-2 gap-4">
            {onDetailCurrent ? (
              <button
                type="button"
                onClick={onDetailCurrent}
                className="text-left text-[13px] font-medium text-fg-tertiary"
              >
                요금제 상세보기 &gt;
              </button>
            ) : (
              <span />
            )}
            {onDetailSelected ? (
              <button
                type="button"
                onClick={onDetailSelected}
                className="text-left text-[13px] font-medium text-compare-selected-strong"
              >
                요금제 상세보기 &gt;
              </button>
            ) : (
              <span />
            )}
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
