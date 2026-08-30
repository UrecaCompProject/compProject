import { useNavigate, useParams } from 'react-router';

import { PlanDetailContent, usePlanDetail } from '@/features/plan-detail';
import { PlanSubscriptionSheet } from '@/features/plan-subscription';
import { BottomSheet, Button } from '@/shared';

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    plan,
    isLoading,
    errorMessage,
    recommendedPlan,
    isSubscribeOpen,
    setIsSubscribeOpen,
  } = usePlanDetail(id);

  const backToList = () => navigate('/plan');

  return (
    <>
      <BottomSheet
        open
        onOpenChange={(open) => {
          if (!open) backToList();
        }}
        onBack={backToList}
        title={plan?.name ?? '요금제'}
        size="large"
        bodyClassName="px-0 bg-surface-page"
        footer={
          plan && (
            <div className="flex w-full gap-2">
              <Button variant="outline" size="lg" className="flex-1">
                비교 하기
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={() => setIsSubscribeOpen(true)}
              >
                신청 하기
              </Button>
            </div>
          )
        }
      >
        <PlanDetailContent
          plan={plan}
          isLoading={isLoading}
          error={errorMessage}
        />
      </BottomSheet>

      {recommendedPlan && (
        <PlanSubscriptionSheet
          open={isSubscribeOpen}
          onOpenChange={setIsSubscribeOpen}
          plan={recommendedPlan}
        />
      )}
    </>
  );
}
