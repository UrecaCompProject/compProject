import { describe, expect, it } from 'vitest';

import { mapReportRecommendations } from './getReport';

describe('mapReportRecommendations', () => {
  it('중첩 plans 응답이 없어도 plan_id로 조회한 요금제 상세를 카드 데이터로 만든다', () => {
    const result = mapReportRecommendations(
      [
        {
          report_id: 'report-1',
          plan_id: 101,
          reason: '데이터 사용량에 적합',
          savings: 10000,
          sort_order: 0,
        },
      ],
      [
        {
          id: 101,
          name: '5G 20GB',
          carrier: '테스트 통신사',
          category: '5G',
          target_age: '20대',
          data_tier: '20GB',
          monthly_fee: 50000,
          data: '20GB',
          data_amount_gb: 20,
          data_speed_after: '',
          voice: '무제한',
          call_amount_min: 0,
          message: '무제한',
          sms_amount: 0,
          share_data: '',
          tethering: '',
          notes: '',
          benefits: [],
          ott_benefits: [],
          add_ons: [],
          contract_period_months: null,
          is_active: true,
          sort_order: 0,
        },
      ],
    );

    expect(result.get('report-1')).toHaveLength(1);
    expect(result.get('report-1')?.[0]).toMatchObject({
      planId: '101',
      planName: '5G 20GB',
      reason: '데이터 사용량에 적합',
      savingAmount: 10000,
    });
  });
});
