// 데이터 사용량/예산은 정확한 수치 대신 구간(칩)으로 입력받는다.
// RecommendationForm(입력 폼 요약 문구)과 useChatReport(레포트용 사용자 조건 문자열)가
// 이 구간 목록을 공유해, 사용자가 실제로 고른 "5GB ~ 10GB" 같은 범위 표현이
// 대표값(정수)으로 뭉개지지 않고 채팅 로그·레포트 양쪽에 그대로 남게 한다.

export interface ConsultBucket {
  label: string;
  value: number | string;
}

// "미확인/무관" 칩의 sentinel 값 — 숫자로 변환할 수 없어 제출 대상에서 자연히 빠진다.
export const NO_PREFERENCE = 'no_preference';

// value는 화면 표시뿐 아니라 추천 서버(recommend.ts)의 필터 임계값으로도 그대로
// 쓰인다 — "이 요금제는 데이터가 value GB 이상이어야 한다"는 최소 요구치로 취급됨.
// 그래서 "70GB 이상"/"무제한"처럼 상한이 없는 구간은 범위의 하한값(또는
// parseDataGB('무제한')의 실제 반환값인 1000)을 그대로 써야 한다 — 임의로 더
// 큰 수(과거 135/9999)를 넣으면 정작 조건을 만족하는 요금제가 전부
// 걸러져버린다. "30GB ~ 70GB"는 "70GB 이상"과 값이 겹치지 않도록 69를 쓴다.
export const DATA_USAGE_BUCKETS: ConsultBucket[] = [
  { label: '5GB 이하', value: 5 },
  { label: '5GB ~ 15GB', value: 15 },
  { label: '15GB ~ 30GB', value: 30 },
  { label: '30GB ~ 70GB', value: 69 },
  { label: '70GB 이상', value: 70 },
  { label: '무제한', value: 1000 },
  { label: '미확인', value: NO_PREFERENCE },
];

export const BUDGET_BUCKETS: ConsultBucket[] = [
  { label: '3만원 이하', value: 30000 },
  { label: '3만원 ~ 5만원', value: 50000 },
  { label: '5만원 ~ 7만원', value: 70000 },
  { label: '7만원 ~ 9만원', value: 90000 },
  { label: '9만원 이상', value: 110000 },
  { label: '무관', value: NO_PREFERENCE },
];

// 대표값(정수)으로 해당 구간의 원래 라벨("5GB ~ 10GB")을 되찾는다.
export function findBucketLabel(
  buckets: ConsultBucket[],
  value: number,
): string | undefined {
  return buckets.find((bucket) => bucket.value === value)?.label;
}

// RecommendationForm(입력 폼 요약 문구)과 buildRecommendTarget(레포트용 target
// 문자열)이 공유 — priority 값을 사람이 읽을 수 있는 라벨로 바꾼다.
export const PRIORITY_LABELS: Record<string, string> = {
  budget: '가격 우선',
  data: '데이터 용량 우선',
  max_data: '최대 데이터',
};
