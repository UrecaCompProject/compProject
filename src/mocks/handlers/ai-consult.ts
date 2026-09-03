import { http, HttpResponse } from 'msw';

import type {
  ConsultInput,
  ConsultResponse,
  ReportInput,
  ReportNotes,
} from '@/shared/lib/aiConsult';

import { plans, mockSession } from '../db';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// 요금제 추천 mock 응답 생성
function buildRecommendResponse(input: ConsultInput): ConsultResponse {
  let candidates = plans.filter((p) => p.is_active);

  if (input.budget && input.budget > 0) {
    candidates = candidates.filter((p) => p.monthly_fee <= input.budget!);
  }
  if (input.dataUsage && input.dataUsage > 0) {
    candidates = candidates.filter((p) => p.data_amount_gb >= input.dataUsage!);
  }

  // 후보가 부족하면 전체에서 상위 3개
  if (candidates.length < 3) {
    candidates = plans.filter((p) => p.is_active);
  }

  candidates = candidates.slice(0, 3);

  const recommendations = candidates.map((p) => ({
    planId: String(p.id),
    planName: p.name,
    reason: p.notes,
    savingAmount: 0,
    monthlyFee: p.monthly_fee,
    data: p.data,
    dataAmountGb: p.data_amount_gb,
    benefits: p.benefits,
    category: p.category,
    targetAge: p.target_age,
    dataSpeedAfter: p.data_speed_after,
    voice: p.voice,
    callAmountMin: p.call_amount_min,
    message: p.message,
    smsAmount: p.sms_amount,
    shareData: p.share_data,
    tethering: p.tethering,
    notes: p.notes,
  }));

  return {
    recommendations,
    notice: '고객님의 사용 패턴을 분석한 결과, 다음 요금제를 추천드립니다.',
    quickReplies: ['요금제 비교하기', '레포트 받기', '다른 요금제 보기'],
    mode: 'recommend',
  };
}

// 요금제 비교 mock 응답
function buildCompareResponse(input: ConsultInput): ConsultResponse {
  const planA = plans.find((p) => p.name === input.comparePlanA);
  const planB = plans.find((p) => p.name === input.comparePlanB);

  if (!planA || !planB) {
    return {
      recommendations: [],
      notice: '비교할 요금제를 찾을 수 없습니다.',
      mode: 'compare',
    };
  }

  const toRec = (p: (typeof plans)[0]) => ({
    planId: String(p.id),
    planName: p.name,
    reason: p.notes,
    savingAmount: 0,
    monthlyFee: p.monthly_fee,
    data: p.data,
    dataAmountGb: p.data_amount_gb,
    benefits: p.benefits,
  });

  return {
    recommendations: [],
    mode: 'compare',
    compareResult: {
      summary: `${planA.name}과 ${planB.name}를 비교한 결과입니다.`,
      planAAdvantage: `${planA.name}은 월 ${planA.monthly_fee.toLocaleString()}원으로 ${planA.data} 데이터를 제공합니다.`,
      planBAdvantage: `${planB.name}은 월 ${planB.monthly_fee.toLocaleString()}원으로 ${planB.data} 데이터를 제공합니다.`,
      recommendedPlanId:
        planA.monthly_fee <= planB.monthly_fee
          ? String(planA.id)
          : String(planB.id),
      reason: '더 나은 가성비를 제공하는 요금제입니다.',
      planA: toRec(planA),
      planB: toRec(planB),
    },
  };
}

// 레포트 생성 mock 응답 — 추천/비교/가입 요금제는 클라이언트가 이미 구조화된
// 데이터로 갖고 있어 edge function은 자유 서술 요약(otherNotes)만 반환한다.
function buildReportResponse(): {
  report: ReportNotes;
  mode: 'report';
} {
  return {
    mode: 'report',
    report: {
      title: '데이터 중심 요금제 상담',
      summary: '상담 내용을 바탕으로 요금제 추천 레포트를 생성했습니다.',
      usageType: '일반 사용자',
      importantConditions: ['데이터 용량', '월 정액', '속도 제한'],
      qaPairs: [],
      changedPlanAdvantage: '',
    },
  };
}

export const aiConsultHandlers = [
  http.post(`${SUPABASE_URL}/functions/v1/ai-consult`, async ({ request }) => {
    // Edge Function은 인증된 사용자만 호출 가능
    if (!mockSession) {
      return HttpResponse.json(
        {
          error: '로그인이 필요해요. 다시 로그인해 주세요.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as ConsultInput &
      ReportInput & { mode?: string };

    // 약간의 지연 시뮬레이션 (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (body.mode === 'report') {
      return HttpResponse.json(buildReportResponse());
    }

    if (body.mode === 'compare' || (body.comparePlanA && body.comparePlanB)) {
      return HttpResponse.json(buildCompareResponse(body));
    }

    // 기본: recommend 모드
    return HttpResponse.json(buildRecommendResponse(body));
  }),
];
