import { useState } from 'react';

import { PlanSubscriptionSheet } from '@/features/plan-subscription';
import { BottomSheet } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { useReports } from '../model/useReports';

import PreviewReport from './PreviewReport';
import ReportDetail from './ReportDetail';

type ReportSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ReportView = 'list' | 'detail';

export default function ReportSheet({ open, onOpenChange }: ReportSheetProps) {
  const { data: reports = [], isLoading } = useReports(open);
  const [activeView, setActiveView] = useState<ReportView>('list');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<RecommendedPlan | null>(null);

  // 상세는 이미 받아둔 목록 배열에서 골라 쓴다 — 클릭할 때마다 재조회하지 않음.
  const selectedReport =
    reports.find((report) => report.id === selectedReportId) ?? null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setActiveView('list');
    }

    onOpenChange(nextOpen);
  };

  const handleBack = () => {
    setActiveView('list');
  };

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    setActiveView('detail');
  };

  const handleSelectPlan = (plan: RecommendedPlan) => {
    handleOpenChange(false);
    setSubscriptionPlan(plan);
    setSubscriptionOpen(true);
  };

  const title =
    activeView === 'detail'
      ? (selectedReport?.summary_title ?? '상담 리포트')
      : '상담 리포트';

  return (
    <>
      <BottomSheet
        open={open}
        className="bg-surface-page"
        onOpenChange={handleOpenChange}
        title={title}
        onBack={activeView === 'detail' ? handleBack : undefined}
        size="full"
        bodyClassName="p-0"
      >
        <div className="relative h-full overflow-hidden">
          <div className="h-full overflow-y-auto px-5 pb-6">
            <div className="flex flex-col gap-2">
              {isLoading && (
                <p className="py-8 text-center text-caption text-fg-tertiary">
                  상담 리포트를 불러오는 중...
                </p>
              )}
              {!isLoading && reports.length === 0 && (
                <p className="py-8 text-center text-caption text-fg-tertiary">
                  아직 생성된 상담 리포트가 없어요.
                </p>
              )}
              {!isLoading &&
                reports.map((report) => (
                  <PreviewReport
                    key={report.id}
                    report={report}
                    onClick={() => handleSelectReport(report.id)}
                  />
                ))}
            </div>
          </div>

          <div
            className={`absolute inset-0 h-full overflow-y-auto  bg-surface-card transition-transform duration-300 ease-out ${
              activeView === 'detail' ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <ReportDetail
              key={selectedReportId ?? 'empty'}
              report={selectedReport}
              onSelectPlan={handleSelectPlan}
            />
          </div>
        </div>
      </BottomSheet>

      <PlanSubscriptionSheet
        active={subscriptionOpen}
        open={subscriptionOpen}
        onOpenChange={setSubscriptionOpen}
        plan={subscriptionPlan}
        onComplete={() => setSubscriptionOpen(false)}
      />
    </>
  );
}
