import { maskPhone } from '@/features/auth/utils/signup';
import { Line } from '@/features/shared';
import {
  InfoRow,
  SectionCard,
  UsageProgressRow,
  UsageTrendSection,
} from '@/features/usage';

export default function MyPage() {
  return (
    <div className="bg-surface-page">
      <div className="flex flex-col px-4 py-3">
        <div className="leading-[170%] text-fg-tertiary text-[14px] ">
          <span className="text-medium">모바일</span>
          <span className="ml-3 text-regular">
            {maskPhone('010-9999-6399')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionCard>
          <div className="text-bold-16-140">가입 정보</div>

          <div className="flex flex-col gap-2">
            <InfoRow label="요금제" value="유쓰 5G 슬림+" highlight />
            <InfoRow
              label="모바일 기기"
              value="IPhone 14 Pro_128(A2890-128)"
              highlight
            />
            <InfoRow label="개통일" value="2023-09-11" />
            <InfoRow label="가입일" value="2018-11-17" />
          </div>
        </SectionCard>

        <SectionCard>
          <div className="text-bold-16-140">요금 조회 / 납부 정보</div>
          <Line />
          <div className="flex justify-between">
            <div className="text-bold-16-140">최종 예상 요금</div>
            <div className="text-bold-16-140 text-reward-active">
              월 34,000원
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="text-bold-16-140">데이터 상세</div>

          <div className="flex flex-col gap-1">
            <div className="text-bold-16-140 leading-[130%]">
              오늘 기준으로 <span className="text-reward-active">17일</span>{' '}
              남았습니다
            </div>
            <div className="text-regular-12-130 text-fg-disabled">
              2026.08.01 ~ 2026.08.31
            </div>
          </div>

          <UsageProgressRow
            label="5G 데이터"
            value="9.04GB"
            total="17.00GB"
            percent={100 - (9.04 / 17) * 100}
          />
          <UsageProgressRow
            label="400kB 속도 데이터"
            value="무제한"
            percent={100}
          />
        </SectionCard>

        <SectionCard>
          <div className="text-bold-16-140">통화</div>

          <UsageProgressRow
            label="유무선 통화"
            value="224분 5초"
            total="300분"
            percent={100 - (224 / 300) * 100}
          />
          <UsageProgressRow
            label="영상 & 부가 통화"
            value="15분 42초"
            total="300분"
            percent={100 - (15 / 300) * 100}
          />
        </SectionCard>

        <SectionCard>
          <div className="text-bold-16-140">문자</div>

          <UsageProgressRow
            label="메세지"
            value="100건"
            total="100건"
            percent={(100 / 100) * 100}
          />
        </SectionCard>

        <UsageTrendSection />
      </div>
    </div>
  );
}
