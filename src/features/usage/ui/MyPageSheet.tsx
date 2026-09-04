import { useUsage } from '@/entities/usage';
import { useAuth } from '@/entities/user';
import { BottomSheet } from '@/shared';
import { maskPhone } from '@/shared/lib/maskPhone';

import MyPageBillingSection from './MyPageBillingSection';
import MyPageCallSection from './MyPageCallSection';
import MyPageDataSection from './MyPageDataSection';
import MyPageInfoSection from './MyPageInfoSection';
import MyPageSmsSection from './MyPageSmsSection';
import UsageTrendSection from './UsageTrendSection';

type MyPageSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestPlanRecommend?: () => void;
};

export default function MyPageSheet({
  open,
  onOpenChange,
  onRequestPlanRecommend,
}: MyPageSheetProps) {
  const { user } = useAuth();
  const {
    currentPlan,
    trendData,
    billingPeriodStart,
    billingPeriodEnd,
    daysUntilPeriodEnd,
    dataRemaining,
    dataPercent,
    callPercent,
    callUsedSeconds,
    smsRemaining,
    smsPercent,
    gbBenefit,
  } = useUsage();

  // 요금제가 없는 사용자는 사용량·납부·추이 섹션을 숨기고 추천받기 UI만 노출
  const hasPlan = !!currentPlan;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      size="full"
      bodyClassName="p-0"
      title="마이페이지"
    >
      <div className="bg-surface-page">
        {/* 모바일 전화번호 정보 section */}
        <div className="flex flex-col px-4 py-3">
          <div className="leading-[170%] text-fg-tertiary text-[14px] flex">
            <p className="text-medium">개인 정보</p>
            <p className="ml-3 text-semibold">
              {maskPhone(user?.user_metadata?.name ?? '')}
            </p>
            <p className="ml-2 text-semibold">
              {maskPhone(user?.user_metadata?.phone ?? '')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* 요금제 정보 section */}
          <MyPageInfoSection
            planName={currentPlan?.planName ?? '-'}
            updatedAt={user?.updated_at}
            createdAt={user?.created_at}
            hasPlan={hasPlan}
            onRequestPlanRecommend={onRequestPlanRecommend}
          />
          {hasPlan && (
            <>
              {/* 요금 납부 section */}
              <MyPageBillingSection
                gbBenefit={gbBenefit}
                monthlyFee={currentPlan?.monthlyFee}
              />
              {/* 데이터 상세 section */}
              <MyPageDataSection
                billingPeriodStart={billingPeriodStart}
                billingPeriodEnd={billingPeriodEnd}
                daysUntilPeriodEnd={daysUntilPeriodEnd}
                dataRemaining={dataRemaining}
                dataTotal={currentPlan?.dataAmountGb}
                dataPercent={dataPercent}
                dataSpeedAfter={currentPlan?.dataSpeedAfter}
              />
              {/* 통화 section */}
              <MyPageCallSection
                callTotal={currentPlan?.callAmountMin}
                callPercent={callPercent}
                callUsedSeconds={callUsedSeconds}
              />
              {/* 문자 section */}
              <MyPageSmsSection
                smsRemaining={smsRemaining}
                smsTotal={currentPlan?.smsAmount}
                smsPercent={smsPercent}
              />
              {/* 평균 데이터 사용량 section */}
              <UsageTrendSection data={trendData} />
            </>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
