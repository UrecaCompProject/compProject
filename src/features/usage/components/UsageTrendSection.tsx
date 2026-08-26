import { useState } from 'react';

import { Tab } from '@/features/shared';

import LineChart from './LineChart';
import SectionCard from './SectionCard';

// TODO: 실제 사용량 조회 API 연동 전까지의 임시 데이터
const MONTHLY_USAGE = [
  { month: '9월', usage: 12.4 },
  { month: '10월', usage: 15.1 },
  { month: '11월', usage: 9.8 },
  { month: '12월', usage: 13.6 },
  { month: '1월', usage: 11.2 },
  { month: '2월', usage: 14.7 },
  { month: '3월', usage: 10.5 },
  { month: '4월', usage: 16.3 },
  { month: '5월', usage: 12.9 },
  { month: '6월', usage: 15.8 },
  { month: '7월', usage: 13.1 },
  { month: '8월', usage: 9.04 },
];

export default function UsageTrendSection() {
  const [tabValue, setTabValue] = useState<'3' | '6' | '12'>('3');
  const visibleUsage = MONTHLY_USAGE.slice(-Number(tabValue));

  return (
    <SectionCard>
      <div className="text-bold-16-140">평균 데이터 사용량</div>
      <div className="text-regular-12-130 text-fg-disabled">
        지난달까지 집계된 데이터 사용량을 기준으로 산출된 평균 데이터
        사용량입니다.
      </div>

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
      />
    </SectionCard>
  );
}
