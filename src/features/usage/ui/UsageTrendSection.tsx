import { useState } from 'react';

import { Card, LineChart, Tab } from '@/shared';

export interface MonthlyUsage {
  month: string;
  usage: number;
}

interface UsageTrendSectionProps {
  data: MonthlyUsage[];
}

const Y_TICK_COUNT: Record<'3' | '6' | '12', number> = {
  '3': 4,
  '6': 5,
  '12': 6,
};

export default function UsageTrendSection({ data }: UsageTrendSectionProps) {
  const [tabValue, setTabValue] = useState<'3' | '6' | '12'>('3');
  const visibleUsage = data.slice(-Number(tabValue));

  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">평균 데이터 사용량</div>

      <Tab
        options={[
          { label: '3개월', value: '3' },
          { label: '6개월', value: '6' },
          { label: '12개월', value: '12' },
        ]}
        value={tabValue}
        onChange={setTabValue}
      />

      <LineChart
        labels={visibleUsage.map((item) => item.month)}
        values={visibleUsage.map((item) => item.usage)}
        valueLabel="데이터 사용량"
        unit="GB"
        yTickCount={Y_TICK_COUNT[tabValue]}
      />
      <div className="text-regular-12-130 text-fg-disabled flex gap-1">
        <span>・</span>
        <span className="break-keep">
          지난달까지 집계된 데이터 사용량을 기준으로 산출된 평균 데이터
          사용량입니다.
        </span>
      </div>
    </Card>
  );
}
