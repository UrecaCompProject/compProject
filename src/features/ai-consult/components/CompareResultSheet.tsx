import { useState } from 'react';

import PlanCompare, {
  type PlanCompareData,
} from '@/features/plan-change/components/PlanCompare';
import { BottomSheet, Button } from '@/features/shared';
import type { CompareResult } from '@/lib/aiConsult';

interface CompareResultSheetProps {
  result: CompareResult;
  onSubscribe?: () => void;
}

function toFeeText(monthlyFee: number | undefined): string {
  if (monthlyFee === undefined) return '-';
  return `${monthlyFee.toLocaleString()}원`;
}

function toPlanCompareData(result: CompareResult): PlanCompareData {
  const { planA, planB } = result;
  return {
    currentPlanName: planA.planName,
    currentFee: toFeeText(planA.monthlyFee),
    currentDiscount: '-',
    currentData: planA.data ?? '-',
    currentTethering: planA.tethering ?? '-',
    currentShareData: planA.shareData ?? '-',
    currentVoice: planA.voice ?? '-',
    currentMessage: planA.message ?? '-',

    selectedPlanName: planB.planName,
    selectedFee: toFeeText(planB.monthlyFee),
    selectedDiscount: '-',
    selectedData: planB.data ?? '-',
    selectedTethering: planB.tethering ?? '-',
    selectedShareData: planB.shareData ?? '-',
    selectedVoice: planB.voice ?? '-',
    selectedMessage: planB.message ?? '-',
  };
}

export default function CompareResultSheet({
  result,
  onSubscribe,
}: CompareResultSheetProps) {
  const [open, setOpen] = useState(false);
  const data = toPlanCompareData(result);

  return (
    <>
      <div className="mt-2 rounded-2xl bg-surface-page p-3 text-center">
        <p className="text-body-sm font-medium text-fg-primary">
          {result.planA.planName} <span className="text-fg-tertiary">vs</span>{' '}
          {result.planB.planName}
        </p>
      </div>
      <Button
        variant="secondary"
        size="md"
        className="w-full mt-2"
        onClick={() => setOpen(true)}
      >
        비교 상세 보기
      </Button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="요금제 비교"
        description={result.summary}
        size="large"
        bodyClassName="px-0"
      >
        <PlanCompare
          data={data}
          onChangePlan={onSubscribe}
          className="w-full"
        />
      </BottomSheet>
    </>
  );
}
