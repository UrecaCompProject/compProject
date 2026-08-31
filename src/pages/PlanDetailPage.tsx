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
  const subscribing = isSubscribeOpen && !!recommendedPlan;

  // 신청 플로우는 자체 BottomSheet를 만들지 않고, 이 화면의 시트에 내용만
  // 갈아끼운다(renderShell). 첫 단계에서 뒤로가기 → 요금제 상세로 복귀.
  return (
    <PlanSubscriptionSheet
      plan={recommendedPlan}
      active={subscribing}
      onExit={() => setIsSubscribeOpen(false)}
      onComplete={backToList}
      renderShell={(shell) => (
        <BottomSheet
          open
          onOpenChange={(open) => {
            if (!open) backToList();
          }}
          onBack={subscribing ? shell.onBack : backToList}
          title={subscribing ? shell.title : (plan?.name ?? '요금제')}
          description={subscribing ? shell.description : undefined}
          size={subscribing ? shell.size : 'large'}
          bodyClassName={subscribing ? 'px-5' : 'px-0 bg-surface-page'}
          footer={
            subscribing ? (
              shell.footer
            ) : plan ? (
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
            ) : null
          }
        >
          {subscribing ? (
            shell.children
          ) : (
            <PlanDetailContent
              plan={plan}
              isLoading={isLoading}
              error={errorMessage}
            />
          )}
        </BottomSheet>
      )}
    />
  );
}
