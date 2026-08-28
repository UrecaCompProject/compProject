import { Fragment } from 'react';

interface MonthlyUsage {
  month: string;
  usage: number;
}

// TODO: 실제 사용량 조회 API 연동 전까지의 임시 데이터
const MONTHLY_USAGE: MonthlyUsage[] = [
  { month: '5월', usage: 125.9 },
  { month: '6월', usage: 93.4 },
  { month: '7월', usage: 103.8 },
];

const CHART_HEIGHT = 160;
const BAR_AREA_HEIGHT = 120;

export default function UsageOverPast3Months() {
  const maxUsage = Math.max(...MONTHLY_USAGE.map((item) => item.usage));
  const average =
    MONTHLY_USAGE.reduce((sum, item) => sum + item.usage, 0) /
    MONTHLY_USAGE.length;
  const averageTop = CHART_HEIGHT - (average / maxUsage) * BAR_AREA_HEIGHT;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-bold text-[21px] leading-[150%] ">
          3개월 데이터 사용량
        </div>
        <div className="text-[14px] mt-1 mb-1 text-fg-tertiary">
          최근 사용 흐름을 한눈에 확인하세요
        </div>
      </div>
      <div className="mx-auto">
        <div className="text-[14px] font-bold mt-2">
          최근 3개월 동안 평균{' '}
          <span className="text-[16px] text-brand-promo-primary">
            {average.toFixed(1)}GB
          </span>{' '}
          썼어요
        </div>

        <div
          className="relative mt-1 grid justify-center gap-x-10"
          style={{
            gridTemplateRows: `${CHART_HEIGHT}px auto`,
            gridTemplateColumns: `repeat(${MONTHLY_USAGE.length}, 2.25rem)`,
          }}
        >
          <div
            className="absolute -inset-x-6 border-t border-dashed border-border-strong"
            style={{ top: averageTop }}
          />

          {MONTHLY_USAGE.map((item, index) => {
            const isCurrent = index === MONTHLY_USAGE.length - 1;
            const barHeight = (item.usage / maxUsage) * BAR_AREA_HEIGHT;
            const column = index + 1;

            return (
              <Fragment key={item.month}>
                <div
                  className="flex h-full flex-col items-center justify-end gap-1.5"
                  style={{ gridColumn: column, gridRow: 1 }}
                >
                  <span
                    className={`text-[12px] w-12 text-center font-medium ${
                      isCurrent ? 'text-reward-active' : 'text-fg-tertiary'
                    }`}
                  >
                    {item.usage}GB
                  </span>
                  <div
                    className={`w-9 rounded-t-lg rounded-b-sm  ${
                      isCurrent ? 'bg-reward-active' : 'bg-reward-locked'
                    }`}
                    style={{ height: barHeight }}
                  />
                </div>
                <span
                  className={`mt-2 text-center text-[14px] font-medium ${
                    isCurrent ? 'text-reward-active' : 'text-fg-tertiary'
                  }`}
                  style={{ gridColumn: column, gridRow: 2 }}
                >
                  {item.month}
                </span>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
