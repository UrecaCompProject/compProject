import { useEffect, useRef } from 'react';

import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import ComparedPlanCard from './ComparedPlanCard';
import RecommendedPlansCard from './RecommendedPlansCard';
import ReportSummaryCard from './ReportSummaryCard';

import type { ReportRow } from '../api/getReport';

interface ReportDetailProps {
  report: ReportRow | null;
  // 요금제 행 클릭 — 요금제 조회 화면(ReportSheet의 슬라이딩 패널)을 연다.
  onPlanClick?: (plan: RecommendedPlan) => void;
}

export default function ReportDetail({
  report,
  onPlanClick,
}: ReportDetailProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // ReportSheet은 리스트/상세 화면을 언마운트하지 않고 translate-x로만
  // 넘겨서, 상세 화면을 나갔다 다시 들어와도 스크롤 위치가 그대로 남아있다.
  // ReportSheet의 스크롤 컨테이너는 건드리지 않고, 이 화면이 다시 보이는
  // 시점(교차 관찰)을 감지해서 그 스크롤 위치만 맨 위로 되돌린다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scrollParent = root.closest('.overflow-y-auto');
    if (!scrollParent) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          scrollParent.scrollTo({ top: 0 });
        }
      },
      // scrollParent 자신이 translate-x로 움직이는 요소라서, root로 쓰면
      // 로컬 좌표계 기준이라 항상 "보이는" 것으로 계산돼 전환을 못 잡는다.
      // 뷰포트를 기준으로 삼아야 실제로 화면에 들어오는 시점을 감지한다.
      { root: null, threshold: 0.1 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  if (!report) return null;

  const analysis = report.analysis_input;
  const groups = analysis.recommendedPlanGroups ?? [];

  return (
    <div
      ref={rootRef}
      className="pb-10 gap-5 flex flex-col bg-surface-page min-h-full"
    >
      <ReportSummaryCard
        summary={report.summary}
        usageType={analysis.usageType}
        importantConditions={analysis.importantConditions}
        changedPlan={analysis.changedPlan}
      />

      {groups.length > 0 && (
        <RecommendedPlansCard groups={groups} onPlanClick={onPlanClick} />
      )}

      {analysis.comparedPlan && (
        <ComparedPlanCard comparedPlan={analysis.comparedPlan} />
      )}
    </div>
  );
}
