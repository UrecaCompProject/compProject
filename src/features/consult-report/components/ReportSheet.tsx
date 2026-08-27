import { useState } from 'react';

import PlanSubscriptionSheet from '@/features/ai-consult/components/PlanSubscriptionSheet';
import { BottomSheet } from '@/features/shared';
import type { RecommendedPlan } from '@/lib/aiConsult';

import PreviewReport from './PreviewReport';
import ReportDetail from './ReportDetail';

type ReportSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ReportView = 'list' | 'detail';

const titles: Record<ReportView, string> = {
  list: '상담 리포트',
  detail: '2026년 08월 10일 리포트',
};

export default function ReportSheet({ open, onOpenChange }: ReportSheetProps) {
  const [activeView, setActiveView] = useState<ReportView>('list');
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<RecommendedPlan | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setActiveView('list');
    }

    onOpenChange(nextOpen);
  };

  const handleBack = () => {
    setActiveView('list');
  };

  const handleSelectPlan = (plan: RecommendedPlan) => {
    handleOpenChange(false);
    setSubscriptionPlan(plan);
    setSubscriptionOpen(true);
  };

  return (
    <>
      <BottomSheet
        open={open}
        className="bg-surface-page"
        onOpenChange={handleOpenChange}
        title={titles[activeView]}
        onBack={activeView === 'detail' ? handleBack : undefined}
        // description={
        //   activeView === 'list' ? '챗봇 상담 기반 맞춤 상담 리포트' : undefined
        // }
        size="full"
        bodyClassName="p-0"
      >
        <div className="relative h-full overflow-hidden">
          <div className="h-full overflow-y-auto px-5 pb-6">
            <div className="flex flex-col gap-2">
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
              <PreviewReport onClick={() => setActiveView('detail')} />
            </div>
          </div>

          <div
            className={`absolute inset-0 h-full overflow-y-auto  bg-surface-card transition-transform duration-300 ease-out ${
              activeView === 'detail' ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <ReportDetail onSelectPlan={handleSelectPlan} />
          </div>
        </div>
      </BottomSheet>

      <PlanSubscriptionSheet
        key={
          subscriptionOpen ? (subscriptionPlan?.planId ?? 'catalog') : 'closed'
        }
        open={subscriptionOpen}
        onOpenChange={setSubscriptionOpen}
        plan={subscriptionPlan}
        onComplete={() => setSubscriptionOpen(false)}
      />
    </>
  );
}
