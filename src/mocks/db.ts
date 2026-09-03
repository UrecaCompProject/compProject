import type { PlanRow } from '@/entities/plan/model/plan';

// ─────────────────────────────────────────────
// Mock 세션 상태 (auth 핸들러가 관리)
// ─────────────────────────────────────────────
type MockSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    app_metadata: Record<string, unknown>;
    user_metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
} | null;

export let mockSession: MockSession = null;

export function setMockSession(session: MockSession) {
  mockSession = session;
}

export function clearMockSession() {
  mockSession = null;
}

// mock 사용자 (user1@example.com / password)
export const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';
export const MOCK_USER_EMAIL = 'user1@example.com';
export const MOCK_USER_PASSWORD = 'password';

// ─────────────────────────────────────────────
// plans 테이블 (seed.sql의 40개 요금제)
// ─────────────────────────────────────────────
export const plans: PlanRow[] = [
  {
    id: 1,
    name: '데이터플랜300MB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '소용량',
    monthly_fee: 28000,
    data: '300MB',
    data_amount_gb: 0.29296875,
    data_speed_after: '400Kbps',
    voice: '125분',
    call_amount_min: 125,
    message: '150건',
    sms_amount: 150,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 300MB 초과 시 차단',
    notes: '데이터 소진 후 400Kbps로 무제한 이용 가능',
    benefits: [],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    name: '데이터플랜750MB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '소용량',
    monthly_fee: 29000,
    data: '750MB',
    data_amount_gb: 0.732421875,
    data_speed_after: '400Kbps',
    voice: '125분',
    call_amount_min: 125,
    message: '150건',
    sms_amount: 150,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 750MB 초과 시 차단',
    notes: '데이터 소진 후 400Kbps로 무제한 이용 가능',
    benefits: [],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    name: '데이터플랜1.5GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '소용량',
    monthly_fee: 33000,
    data: '1.5GB',
    data_amount_gb: 1.5,
    data_speed_after: '400Kbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 1.5GB 초과 시 차단',
    notes: '데이터 소진 후 400Kbps로 무제한 이용 가능',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 3,
  },
  {
    id: 4,
    name: '데이터플랜5GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '소용량',
    monthly_fee: 37000,
    data: '5GB',
    data_amount_gb: 5,
    data_speed_after: '400Kbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 5GB 초과 시 차단',
    notes: '데이터 소진 후 400Kbps로 무제한 이용 가능',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 4,
  },
  {
    id: 5,
    name: '데이터플랜9GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '중소용량',
    monthly_fee: 47000,
    data: '9GB',
    data_amount_gb: 9,
    data_speed_after: '400Kbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 9GB 초과 시 차단',
    notes: '데이터 소진 후 400Kbps로 무제한 이용 가능',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 5,
  },
  {
    id: 6,
    name: '데이터플랜14GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '중소용량',
    monthly_fee: 55000,
    data: '14GB',
    data_amount_gb: 14,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 14GB 초과 시 차단',
    notes: '데이터 소진 후 1Mbps로 무제한 이용 가능',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 6,
  },
  {
    id: 7,
    name: '데이터플랜24GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '중용량',
    monthly_fee: 59000,
    data: '24GB',
    data_amount_gb: 24,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 24GB 초과 시 차단',
    notes: '데이터 소진 후 1Mbps로 무제한 이용 가능',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 7,
  },
  {
    id: 8,
    name: '데이터플랜31GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '중용량',
    monthly_fee: 61000,
    data: '31GB',
    data_amount_gb: 31,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 31GB 초과 시 차단',
    notes: '데이터 소진 후 1Mbps로 무제한 이용 가능',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 8,
  },
  {
    id: 9,
    name: '데이터플랜50GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '중용량',
    monthly_fee: 63000,
    data: '50GB',
    data_amount_gb: 50,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '기본제공량 내 40GB',
    tethering: '공유데이터 40GB 초과 시 차단',
    notes: '데이터 소진 후 1Mbps로 무제한 이용 가능, 공유데이터 한도 40GB',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 9,
  },
  {
    id: 10,
    name: '데이터플랜80GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '대용량',
    monthly_fee: 66000,
    data: '80GB',
    data_amount_gb: 80,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '기본제공량 내 45GB',
    tethering: '공유데이터 45GB 초과 시 차단',
    notes: '데이터 소진 후 1Mbps로 무제한 이용 가능, 공유데이터 한도 45GB',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 10,
  },
  {
    id: 11,
    name: '데이터플랜95GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '대용량',
    monthly_fee: 68000,
    data: '95GB',
    data_amount_gb: 95,
    data_speed_after: '3Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '기본제공량 내 50GB',
    tethering: '공유데이터 50GB 초과 시 차단',
    notes: '데이터 소진 후 3Mbps로 무제한 이용 가능, 공유데이터 한도 50GB',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 11,
  },
  {
    id: 12,
    name: '데이터플랜125GB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '대용량',
    monthly_fee: 70000,
    data: '125GB',
    data_amount_gb: 125,
    data_speed_after: '5Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '기본제공량 내 55GB',
    tethering: '공유데이터 55GB 초과 시 차단',
    notes: '데이터 소진 후 5Mbps로 무제한 이용 가능, 공유데이터 한도 55GB',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 12,
  },
  {
    id: 13,
    name: '데이터플랜MAX',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '무제한',
    monthly_fee: 85000,
    data: '무제한',
    data_amount_gb: 9999.99,
    data_speed_after: '제한없음',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '별도 70GB',
    tethering: '공유데이터 별도 70GB 초과 시 차단',
    notes:
      '데이터 무제한, 공유데이터 별도 70GB 제공, 2nd 디바이스 1회선 월정액 할인',
    benefits: ['U+ZONE 무료', '2nd디바이스할인(1회선)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 13,
  },
  {
    id: 14,
    name: '플러스플랜105',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '무제한',
    monthly_fee: 105000,
    data: '무제한',
    data_amount_gb: 9999.99,
    data_speed_after: '제한없음',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '별도 100GB',
    tethering: '공유데이터 별도 100GB 초과 시 차단',
    notes:
      '데이터 무제한, 공유데이터 100GB, 2nd 디바이스 2회선 할인 (구 5G 프리미어 플러스)',
    benefits: ['U+ZONE 무료', '2nd디바이스할인(2회선)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 14,
  },
  {
    id: 15,
    name: '디즈니+티빙 너겟65',
    carrier: 'LG U+',
    category: '너겟 5G 선납형+프리미엄플러스(OTT)',
    target_age: '일반',
    data_tier: '무제한',
    monthly_fee: 65000,
    data: '무제한',
    data_amount_gb: 9999.99,
    data_speed_after: '제한없음',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '별도 80GB',
    tethering: '공유데이터 별도 80GB 초과 시 차단',
    notes:
      '너겟65에 프리미엄플러스 디즈니+티빙 선택, 데이터 무제한, 실 체감가 11,200원/월, 너겟 앱 전용',
    benefits: [
      'OTT결합(디즈니 스탠다드+티빙 베이직, 월 19,400원 상당)',
      '너겟쿠폰 18만원',
      'VIP멤버십(24개월)',
      '2nd디바이스할인(1회선)',
      '파티페이결합(2~4회선 시 회선당 3,000원 할인)',
    ],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 15,
  },
  {
    id: 16,
    name: '넷플릭스 너겟65',
    carrier: 'LG U+',
    category: '너겟 5G 선납형+프리미엄플러스(OTT)',
    target_age: '일반',
    data_tier: '무제한',
    monthly_fee: 65000,
    data: '무제한',
    data_amount_gb: 9999.99,
    data_speed_after: '제한없음',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '별도 80GB',
    tethering: '공유데이터 별도 80GB 초과 시 차단',
    notes:
      '너겟65에 프리미엄플러스 넷플릭스 스탠다드 선택, 데이터 무제한, 너겟 앱 전용',
    benefits: [
      'OTT결합(넷플릭스 스탠다드, 월 13,500원 상당)',
      '너겟쿠폰 18만원',
      'VIP멤버십(24개월)',
      '2nd디바이스할인(1회선)',
      '파티페이결합(2~4회선 시 회선당 3,000원 할인)',
    ],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 16,
  },
  {
    id: 17,
    name: '구글AI 너겟65',
    carrier: 'LG U+',
    category: '너겟 5G 선납형+프리미엄플러스(AI)',
    target_age: '일반',
    data_tier: '무제한',
    monthly_fee: 65000,
    data: '무제한',
    data_amount_gb: 9999.99,
    data_speed_after: '제한없음',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '별도 80GB',
    tethering: '공유데이터 별도 80GB 초과 시 차단',
    notes:
      '너겟65에 프리미엄플러스 구글 AI 프로 선택, 제미나이 3 + 2TB 스토리지, 데이터 무제한, 너겟 앱 전용',
    benefits: [
      'AI결합(구글 AI 프로 무료, 월 29,000원 상당)',
      '너겟쿠폰 18만원',
      'VIP멤버십(24개월)',
      '2nd디바이스할인(1회선)',
      '파티페이결합(2~4회선 시 회선당 3,000원 할인)',
    ],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 17,
  },
  {
    id: 18,
    name: '5G 키즈 29',
    carrier: 'LG U+',
    category: '5G 키즈',
    target_age: '키즈(만 4~12세)',
    data_tier: '소용량',
    monthly_fee: 29000,
    data: '3.3GB',
    data_amount_gb: 3.3,
    data_speed_after: '400Kbps',
    voice: '기본제공',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 3.3GB 초과 시 차단',
    notes:
      '만 4세 이상 12세 이하, 1인 1회선, 국제통화/060/로밍 발신 금지, 만 13세 익월 1일 청소년 혜택으로 자동변경',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 18,
  },
  {
    id: 19,
    name: '5G 키즈 39',
    carrier: 'LG U+',
    category: '5G 키즈',
    target_age: '키즈(만 4~12세)',
    data_tier: '소용량',
    monthly_fee: 39000,
    data: '5.5GB',
    data_amount_gb: 5.5,
    data_speed_after: '1Mbps',
    voice: '기본제공',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 5.5GB 초과 시 차단',
    notes:
      '만 4세 이상 12세 이하, 1인 1회선, 국제통화/060/로밍 발신 금지, 만 13세 익월 1일 청소년 혜택으로 자동변경',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 19,
  },
  {
    id: 20,
    name: '5G 키즈 45',
    carrier: 'LG U+',
    category: '5G 키즈',
    target_age: '키즈(만 4~12세)',
    data_tier: '중소용량',
    monthly_fee: 45000,
    data: '9GB',
    data_amount_gb: 9,
    data_speed_after: '1Mbps',
    voice: '기본제공',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 9GB 초과 시 차단',
    notes:
      '만 4세 이상 12세 이하, 1인 1회선, 국제통화/060/로밍 발신 금지, 2022.2.4부터 가입 가능',
    benefits: ['U+ZONE 무료'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 20,
  },
  {
    id: 21,
    name: '데이터플랜1.5GB(청소년혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청소년(만 13~18세)',
    data_tier: '소용량',
    monthly_fee: 33000,
    data: '2.5GB',
    data_amount_gb: 2.5,
    data_speed_after: '400Kbps',
    voice: '기본제공',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 2.5GB 초과 시 차단',
    notes:
      '데이터플랜1.5GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경, 데이터 쉐어링/주고받기 불가',
    benefits: ['U+ZONE 무료', '데이터증량(1.5GB→2.5GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 21,
  },
  {
    id: 22,
    name: '데이터플랜5GB(청소년혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청소년(만 13~18세)',
    data_tier: '소용량',
    monthly_fee: 37000,
    data: '7GB',
    data_amount_gb: 7,
    data_speed_after: '400Kbps',
    voice: '기본제공',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 7GB 초과 시 차단',
    notes:
      '데이터플랜5GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경, 데이터 쉐어링/주고받기 불가',
    benefits: ['U+ZONE 무료', '데이터증량(5GB→7GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 22,
  },
  {
    id: 23,
    name: '데이터플랜9GB(청소년혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청소년(만 13~18세)',
    data_tier: '중소용량',
    monthly_fee: 47000,
    data: '11GB',
    data_amount_gb: 11,
    data_speed_after: '1Mbps',
    voice: '기본제공',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 11GB 초과 시 차단',
    notes:
      '데이터플랜9GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경, 데이터 쉐어링/주고받기 불가',
    benefits: ['U+ZONE 무료', '데이터증량(9GB→11GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 23,
  },
  {
    id: 24,
    name: '데이터플랜14GB(청소년혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청소년(만 13~18세)',
    data_tier: '중소용량',
    monthly_fee: 55000,
    data: '17GB',
    data_amount_gb: 17,
    data_speed_after: '1Mbps',
    voice: '기본제공',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 17GB 초과 시 차단',
    notes:
      '데이터플랜14GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경, 데이터 쉐어링/주고받기 불가',
    benefits: ['U+ZONE 무료', '데이터증량(14GB→17GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 24,
  },
  {
    id: 25,
    name: '데이터플랜24GB(청소년혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청소년(만 13~18세)',
    data_tier: '중용량',
    monthly_fee: 59000,
    data: '31GB',
    data_amount_gb: 31,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 31GB 초과 시 차단',
    notes:
      '데이터플랜24GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경',
    benefits: ['U+ZONE 무료', '데이터증량(24GB→31GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 25,
  },
  {
    id: 26,
    name: '데이터플랜31GB(청소년혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청소년(만 13~18세)',
    data_tier: '중용량',
    monthly_fee: 61000,
    data: '40GB',
    data_amount_gb: 40,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 40GB 초과 시 차단',
    notes:
      '데이터플랜31GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경',
    benefits: ['U+ZONE 무료', '데이터증량(31GB→40GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 26,
  },
  {
    id: 27,
    name: '데이터플랜50GB(청소년혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청소년(만 13~18세)',
    data_tier: '중용량',
    monthly_fee: 63000,
    data: '65GB',
    data_amount_gb: 65,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '기본제공량 내 40GB',
    tethering: '공유데이터 40GB 초과 시 차단',
    notes:
      '데이터플랜50GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경',
    benefits: ['U+ZONE 무료', '데이터증량(50GB→65GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 27,
  },
  {
    id: 28,
    name: '데이터플랜5GB(유쓰혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청년(만 19~34세)',
    data_tier: '중소용량',
    monthly_fee: 37000,
    data: '9GB',
    data_amount_gb: 9,
    data_speed_after: '400Kbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 9GB 초과 시 차단',
    notes:
      '데이터플랜5GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환',
    benefits: ['U+ZONE 무료', '데이터증량(5GB→9GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 28,
  },
  {
    id: 29,
    name: '데이터플랜9GB(유쓰혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청년(만 19~34세)',
    data_tier: '중소용량',
    monthly_fee: 47000,
    data: '15GB',
    data_amount_gb: 15,
    data_speed_after: '400Kbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 15GB 초과 시 차단',
    notes:
      '데이터플랜9GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환',
    benefits: ['U+ZONE 무료', '데이터증량(9GB→15GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 29,
  },
  {
    id: 30,
    name: '데이터플랜14GB(유쓰혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청년(만 19~34세)',
    data_tier: '중용량',
    monthly_fee: 55000,
    data: '26GB',
    data_amount_gb: 26,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 26GB 초과 시 차단',
    notes:
      '데이터플랜14GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환',
    benefits: ['U+ZONE 무료', '데이터증량(14GB→26GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 30,
  },
  {
    id: 31,
    name: '데이터플랜24GB(유쓰혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청년(만 19~34세)',
    data_tier: '중용량',
    monthly_fee: 59000,
    data: '36GB',
    data_amount_gb: 36,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 36GB 초과 시 차단',
    notes:
      '데이터플랜24GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환',
    benefits: ['U+ZONE 무료', '데이터증량(24GB→36GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 31,
  },
  {
    id: 32,
    name: '데이터플랜31GB(유쓰혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청년(만 19~34세)',
    data_tier: '중용량',
    monthly_fee: 61000,
    data: '46GB',
    data_amount_gb: 46,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 46GB 초과 시 차단',
    notes:
      '데이터플랜31GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환',
    benefits: ['U+ZONE 무료', '데이터증량(31GB→46GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 32,
  },
  {
    id: 33,
    name: '데이터플랜50GB(유쓰혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청년(만 19~34세)',
    data_tier: '대용량',
    monthly_fee: 63000,
    data: '70GB',
    data_amount_gb: 70,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '기본제공량 내 40GB',
    tethering: '공유데이터 40GB 초과 시 차단',
    notes:
      '데이터플랜50GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환',
    benefits: ['U+ZONE 무료', '데이터증량(50GB→70GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 33,
  },
  {
    id: 34,
    name: '데이터플랜95GB(유쓰혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '청년(만 19~34세)',
    data_tier: '대용량',
    monthly_fee: 68000,
    data: '135GB',
    data_amount_gb: 135,
    data_speed_after: '3Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '기본제공량 내 50GB',
    tethering: '공유데이터 50GB 초과 시 차단',
    notes:
      '데이터플랜95GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환',
    benefits: ['U+ZONE 무료', '데이터증량(95GB→135GB)'],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 34,
  },
  {
    id: 35,
    name: '디즈니+티빙 너겟69(청년추천)',
    carrier: 'LG U+',
    category: '너겟 5G 선납형+프리미엄플러스(OTT)',
    target_age: '청년(만 19~34세)',
    data_tier: '무제한',
    monthly_fee: 69000,
    data: '무제한',
    data_amount_gb: 9999.99,
    data_speed_after: '제한없음',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '별도 100GB',
    tethering: '공유데이터 별도 100GB 초과 시 차단',
    notes:
      '너겟69에 프리미엄플러스 디즈니+티빙 선택, 데이터 무제한, 실 체감가 -9,900원/월, 최대 78,900원/월 상당 혜택, 너겟 앱 전용',
    benefits: [
      'OTT결합(디즈니 스탠다드+티빙 베이직, 월 19,400원 상당)',
      '너겟쿠폰 18만원',
      'VIP멤버십(24개월)',
      '2nd디바이스할인(2회선)',
      '파티페이결합(2~4회선 시 회선당 3,000원 할인)',
    ],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 35,
  },
  {
    id: 36,
    name: '넷플릭스 너겟69(청년추천)',
    carrier: 'LG U+',
    category: '너겟 5G 선납형+프리미엄플러스(OTT)',
    target_age: '청년(만 19~34세)',
    data_tier: '무제한',
    monthly_fee: 69000,
    data: '무제한',
    data_amount_gb: 9999.99,
    data_speed_after: '제한없음',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '별도 100GB',
    tethering: '공유데이터 별도 100GB 초과 시 차단',
    notes:
      '너겟69에 프리미엄플러스 넷플릭스 프리미엄 선택, 데이터 무제한, 너겟 앱 전용',
    benefits: [
      'OTT결합(넷플릭스 프리미엄, 월 17,000원 상당)',
      '너겟쿠폰 18만원',
      'VIP멤버십(24개월)',
      '2nd디바이스할인(2회선)',
      '파티페이결합(2~4회선 시 회선당 3,000원 할인)',
    ],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 36,
  },
  {
    id: 37,
    name: '구글AI 너겟69(청년추천)',
    carrier: 'LG U+',
    category: '너겟 5G 선납형+프리미엄플러스(AI)',
    target_age: '청년(만 19~34세)',
    data_tier: '무제한',
    monthly_fee: 69000,
    data: '무제한',
    data_amount_gb: 9999.99,
    data_speed_after: '제한없음',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '별도 100GB',
    tethering: '공유데이터 별도 100GB 초과 시 차단',
    notes:
      '너겟69에 프리미엄플러스 구글 AI 프로 선택, 제미나이 3 + 2TB 스토리지, 데이터 무제한, 너겟 앱 전용',
    benefits: [
      'AI결합(구글 AI 프로 무료, 월 29,000원 상당)',
      '너겟쿠폰 18만원',
      'VIP멤버십(24개월)',
      '2nd디바이스할인(2회선)',
      '파티페이결합(2~4회선 시 회선당 3,000원 할인)',
    ],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 37,
  },
  {
    id: 38,
    name: '너겟 5G 20GB 36(청년전용혜택)',
    carrier: 'LG U+',
    category: '너겟 5G 선납형+청년혜택',
    target_age: '청년(만 19~29세)',
    data_tier: '중용량',
    monthly_fee: 36000,
    data: '29GB',
    data_amount_gb: 29,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 300분)',
    call_amount_min: 300,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '불가',
    tethering: '월제공량 29GB 초과 시 차단',
    notes:
      '너겟 5G 20GB 36에 청년 전용 혜택 적용, 만 30세 익월 혜택 종료, 너겟 앱 전용',
    benefits: [
      '파티페이결합(2~4회선 시 회선당 3,000원 할인)',
      '청년전용데이터추가(20GB→29GB)',
    ],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 38,
  },
  {
    id: 39,
    name: '데이터플랜5GB(복지혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '복지(장애인)',
    data_tier: '소용량',
    monthly_fee: 37000,
    data: '6GB',
    data_amount_gb: 6,
    data_speed_after: '400Kbps',
    voice: '기본제공(월 600분)',
    call_amount_min: 600,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 6GB 초과 시 차단',
    notes:
      '데이터플랜5GB에 복지 세그 혜택 적용, 장애인, 영업점/고객센터 신청 필요, 명의자당 1인 1회선',
    benefits: [
      'U+ZONE 무료',
      '데이터증량(5GB→6GB)',
      '음성통화증량(300분→600분)',
    ],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 39,
  },
  {
    id: 40,
    name: '데이터플랜9GB(복지혜택)',
    carrier: 'LG U+',
    category: '통합요금제+세그혜택',
    target_age: '복지(장애인)',
    data_tier: '중소용량',
    monthly_fee: 47000,
    data: '10GB',
    data_amount_gb: 10,
    data_speed_after: '1Mbps',
    voice: '기본제공(월 600분)',
    call_amount_min: 600,
    message: '기본제공',
    sms_amount: 9999,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 10GB 초과 시 차단',
    notes:
      '데이터플랜9GB에 복지 세그 혜택 적용, 장애인, 영업점/고객센터 신청 필요, 명의자당 1인 1회선',
    benefits: [
      'U+ZONE 무료',
      '데이터증량(9GB→10GB)',
      '음성통화증량(300분→600분)',
    ],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 40,
  },
];

// ─────────────────────────────────────────────
// users 테이블
// ─────────────────────────────────────────────
export const users: Array<{
  id: string;
  email: string;
  phone: string;
  nickname: string;
  age_group: string;
}> = [
  {
    id: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    phone: '010-1111-1111',
    nickname: 'UserOne',
    age_group: '일반',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'user2@example.com',
    phone: '010-2222-2222',
    nickname: 'UserTwo',
    age_group: '청년',
  },
];

// ─────────────────────────────────────────────
// current_plans 테이블
// ─────────────────────────────────────────────
export const currentPlans: Array<{
  user_id: string;
  plan_id: number;
  started_at: string;
}> = [
  { user_id: MOCK_USER_ID, plan_id: 1, started_at: '2025-01-15' },
  {
    user_id: '22222222-2222-2222-2222-222222222222',
    plan_id: 5,
    started_at: '2024-11-01',
  },
];

// ─────────────────────────────────────────────
// usage_monthly 테이블
// ─────────────────────────────────────────────
export const usageMonthly: Array<{
  id: string;
  user_id: string;
  year_month: string;
  data_used_gb: number;
  call_used_min: number;
  sms_used_count: number;
  created_at: string;
  updated_at: string;
}> = [
  {
    id: 'u1',
    user_id: MOCK_USER_ID,
    year_month: '2025-03',
    data_used_gb: 3.5,
    call_used_min: 120,
    sms_used_count: 30,
    created_at: '2025-03-01',
    updated_at: '2025-03-01',
  },
  {
    id: 'u2',
    user_id: MOCK_USER_ID,
    year_month: '2025-04',
    data_used_gb: 4.2,
    call_used_min: 150,
    sms_used_count: 45,
    created_at: '2025-04-01',
    updated_at: '2025-04-01',
  },
  {
    id: 'u3',
    user_id: MOCK_USER_ID,
    year_month: '2025-05',
    data_used_gb: 5.1,
    call_used_min: 110,
    sms_used_count: 25,
    created_at: '2025-05-01',
    updated_at: '2025-05-01',
  },
  {
    id: 'u4',
    user_id: MOCK_USER_ID,
    year_month: '2025-06',
    data_used_gb: 4.8,
    call_used_min: 130,
    sms_used_count: 35,
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
  },
  {
    id: 'u5',
    user_id: MOCK_USER_ID,
    year_month: '2025-07',
    data_used_gb: 5.5,
    call_used_min: 140,
    sms_used_count: 40,
    created_at: '2025-07-01',
    updated_at: '2025-07-01',
  },
  {
    id: 'u6',
    user_id: MOCK_USER_ID,
    year_month: '2025-08',
    data_used_gb: 4.9,
    call_used_min: 125,
    sms_used_count: 32,
    created_at: '2025-08-01',
    updated_at: '2025-08-01',
  },
];

// ─────────────────────────────────────────────
// attendances 테이블
// ─────────────────────────────────────────────
export const attendances: Array<{
  id: string;
  user_id: string;
  date: string;
  reward_type: string;
  reward_value: number;
}> = [
  {
    id: 'a1',
    user_id: MOCK_USER_ID,
    date: '2025-08-19',
    reward_type: 'badge',
    reward_value: 1,
  },
  {
    id: 'a2',
    user_id: MOCK_USER_ID,
    date: '2025-08-20',
    reward_type: 'badge',
    reward_value: 1,
  },
  {
    id: 'a3',
    user_id: MOCK_USER_ID,
    date: '2025-08-21',
    reward_type: 'badge',
    reward_value: 1,
  },
];

// ─────────────────────────────────────────────
// attendance_streaks 테이블
// ─────────────────────────────────────────────
export const attendanceStreaks: Array<{
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_attended_at: string;
}> = [
  {
    user_id: MOCK_USER_ID,
    current_streak: 3,
    longest_streak: 3,
    last_attended_at: '2025-08-21',
  },
];

// ─────────────────────────────────────────────
// badges 테이블
// ─────────────────────────────────────────────
export const GAME_REWARD_BADGE_ID = '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f201';
export const ATTENDANCE_REWARD_BADGE_ID =
  '1498c68c-7d17-4c8e-9217-e22c5c1298bd';

export const badges = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    name: '첫 출석',
    description: '첫 출석 보상',
    type: 'attendance',
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: '첫 상담',
    description: '첫 AI 상담 완료',
    type: 'consultation',
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    name: '첫 교환',
    description: '첫 쿠폰 교환',
    type: 'exchange',
  },
];

// ─────────────────────────────────────────────
// user_badges 테이블
// ─────────────────────────────────────────────
export const userBadges: Array<{
  user_id: string;
  badge_id: string;
  balance: number;
  total_earned: number;
  updated_at: string;
}> = [
  {
    user_id: MOCK_USER_ID,
    badge_id: 'b1111111-1111-1111-1111-111111111111',
    balance: 3,
    total_earned: 3,
    updated_at: '2025-08-21',
  },
  {
    user_id: MOCK_USER_ID,
    badge_id: 'b2222222-2222-2222-2222-222222222222',
    balance: 1,
    total_earned: 1,
    updated_at: '2025-08-21',
  },
  {
    user_id: MOCK_USER_ID,
    badge_id: 'b3333333-3333-3333-3333-333333333333',
    balance: 0,
    total_earned: 0,
    updated_at: '2025-08-21',
  },
];

// ─────────────────────────────────────────────
// games 테이블
// ─────────────────────────────────────────────
export const games = [
  {
    id: 'g1111111-1111-1111-1111-111111111111',
    type: 'quiz',
    name: '요금제 퀴즈',
  },
  {
    id: 'g2222222-2222-2222-2222-222222222222',
    type: 'roulette',
    name: '룰렛 이벤트',
  },
];

// ─────────────────────────────────────────────
// game_results 테이블
// ─────────────────────────────────────────────
export const gameResults: Array<{
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  played_at: string;
}> = [
  {
    id: 'gr1',
    user_id: MOCK_USER_ID,
    game_id: 'g1111111-1111-1111-1111-111111111111',
    score: 100,
    played_at: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────
// products 테이블
// ─────────────────────────────────────────────
export const products: Array<{
  id: string;
  name: string;
  description: string | null;
  required_badges: number;
  stock: number;
  is_active: boolean;
  image: string | null;
}> = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    name: '스타벅스 아메리카노',
    description: '스타벅스 아메리카노 기프티콘',
    required_badges: 3,
    stock: 100,
    is_active: true,
    image: null,
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    name: '베스킨라빈스 싱글레귤러',
    description: '베스킨라빈스 싱글레귤러 쿠폰',
    required_badges: 5,
    stock: 50,
    is_active: true,
    image: null,
  },
];

// ─────────────────────────────────────────────
// exchanges 테이블
// ─────────────────────────────────────────────
export const exchanges: Array<{
  id: string;
  user_id: string;
  product_id: string;
  used_badges: number;
}> = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    user_id: MOCK_USER_ID,
    product_id: 'p1111111-1111-1111-1111-111111111111',
    used_badges: 3,
  },
];

// ─────────────────────────────────────────────
// coupons 테이블
// ─────────────────────────────────────────────
export const coupons: Array<Record<string, unknown>> = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    exchange_id: 'e1111111-1111-1111-1111-111111111111',
    user_id: MOCK_USER_ID,
    product_id: 'p1111111-1111-1111-1111-111111111111',
    barcode: '1234567890',
    encrypted_code: 'enc_1234567890',
    status: 'used',
    used_at: '2025-08-21',
    expired_at: '2026-08-21',
    created_at: '2025-08-21',
    updated_at: '2025-08-21',
  },
];

// ─────────────────────────────────────────────
// consultation_reports 테이블
// ─────────────────────────────────────────────
export const consultationReports: Array<Record<string, unknown>> = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    user_id: MOCK_USER_ID,
    summary_title: '요금제 추천 결과',
    summary: '현재 요금제보다 월 9,000원 절약 가능한 옵션을 찾았습니다.',
    analysis_input: {
      usageType: '일반',
      currentPlan: '데이터플랜300MB',
      recommendedPlans: ['데이터플랜750MB', '데이터플랜5GB'],
      monthlySavingAmount: 9000,
      recommendationReason: '데이터 5GB로 월 9,000원 절약',
      importantConditions: ['데이터 증량', '월 정액 절감'],
      qaPairs: [],
    },
    current_plan_id: 1,
    total_savings: 9000,
    created_at: '2025-08-15',
    updated_at: '2025-08-15',
  },
];

// ─────────────────────────────────────────────
// report_recommendations 테이블
// ─────────────────────────────────────────────
export const reportRecommendations: Array<{
  report_id: string;
  plan_id: number;
  reason: string;
  savings: number;
  sort_order: number;
}> = [
  {
    report_id: 'r1111111-1111-1111-1111-111111111111',
    plan_id: 2,
    reason: '데이터 5GB로 월 9,000원 절약',
    savings: 9000,
    sort_order: 1,
  },
  {
    report_id: 'r1111111-1111-1111-1111-111111111111',
    plan_id: 4,
    reason: '데이터 여유롭고 혜택 풍부',
    savings: 3000,
    sort_order: 2,
  },
];

// ─────────────────────────────────────────────
// subscription_applications 테이블
// ─────────────────────────────────────────────
export const subscriptionApplications: Array<Record<string, unknown>> = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    user_id: MOCK_USER_ID,
    target_plan_id: 2,
    current_plan_id: 1,
    status: 'completed',
    identity_verified: false,
    terms_agreed_at: '2025-08-18',
    requested_at: '2025-08-18',
  },
];

// ─────────────────────────────────────────────
// subscription_status_logs 테이블
// ─────────────────────────────────────────────
export const subscriptionStatusLogs: Array<Record<string, unknown>> = [
  {
    id: 'sl1',
    application_id: 'a1111111-1111-1111-1111-111111111111',
    status: 'submitted',
    changed_at: '2025-08-18',
    note: '신청 접수',
  },
  {
    id: 'sl2',
    application_id: 'a1111111-1111-1111-1111-111111111111',
    status: 'in_review',
    changed_at: '2025-08-19',
    note: '서류 검토 중',
  },
  {
    id: 'sl3',
    application_id: 'a1111111-1111-1111-1111-111111111111',
    status: 'completed',
    changed_at: '2025-08-20',
    note: '가입 완료',
  },
];

// ─────────────────────────────────────────────
// terms_consents 테이블
// ─────────────────────────────────────────────
export const termsConsents: Array<Record<string, unknown>> = [
  {
    id: 'tc1',
    user_id: MOCK_USER_ID,
    application_id: 'a1111111-1111-1111-1111-111111111111',
    term_type: 'privacy',
    version: 'v1.0',
    agreed_at: '2025-08-18',
    ip: '127.0.0.1',
  },
  {
    id: 'tc2',
    user_id: MOCK_USER_ID,
    application_id: 'a1111111-1111-1111-1111-111111111111',
    term_type: 'service',
    version: 'v1.0',
    agreed_at: '2025-08-18',
    ip: '127.0.0.1',
  },
];
