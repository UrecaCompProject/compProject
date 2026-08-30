import { useUsage } from '@/entities/usage';
import { useAuth } from '@/entities/user';
import { maskPhone } from '@/features/auth/lib/signup';
import {
  MyPageBillingSection,
  MyPageCallSection,
  MyPageDataSection,
  MyPageInfoSection,
  MyPageSmsSection,
  UsageTrendSection,
} from '@/features/usage';

export default function MyPage() {
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

  console.log(currentPlan);

  return (
    <div className="bg-surface-page">
      {/* 모바일 전화번호 정보 section */}
      <div className="flex flex-col px-4 py-3">
        <div className="leading-[170%] text-fg-tertiary text-[14px] ">
          <span className="text-medium">모바일</span>
          <span className="ml-3 text-regular">
            {maskPhone(user?.user_metadata?.phone ?? '')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* 요금제 정보 section */}
        <MyPageInfoSection
          planName={currentPlan?.planName ?? '-'}
          updatedAt={user?.updated_at}
          createdAt={user?.created_at}
        />
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
      </div>
    </div>
  );
}
