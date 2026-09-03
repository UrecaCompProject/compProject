import type { PlanDetailItem } from '@/shared/types/plan';

export type { PlanDetailItem };

export type PriceRangeKey = 'all' | 'under5' | '5to10' | '10to20' | '20to30';
export type DataRangeKey =
  | 'all'
  | 'under500mb'
  | '500mbTo5gb'
  | '5to10gb'
  | '10to20gb'
  | '20to40gb'
  | 'unlimited';
export type AgeGroupKey = 'all' | '키즈' | '청소년' | '청년' | '복지';

export interface PlanFilterState {
  price: PriceRangeKey;
  data: DataRangeKey;
  age: AgeGroupKey;
}

export const DEFAULT_PLAN_FILTER: PlanFilterState = {
  price: 'all',
  data: 'all',
  age: 'all',
};

interface RangeOption<K extends string> {
  key: K;
  label: string;
  match: (plan: PlanDetailItem) => boolean;
}

// 데이터 필드("300MB", "1.5GB", "31GB + 1Mbps 무제한" 등)에서 GB 수치를 파싱한다.
// "무제한"이 포함되어 있으면 용량 판정과 별개로 무제한 여부로 우선 처리한다.
function parseDataGb(data: string): number | null {
  const match = /([\d.]+)\s*(GB|MB)/i.exec(data);
  if (!match) return null;
  const value = Number(match[1]);
  return match[2].toUpperCase() === 'MB' ? value / 1024 : value;
}

function isUnlimitedData(data: string): boolean {
  return data.includes('무제한');
}

export const PRICE_RANGE_OPTIONS: RangeOption<PriceRangeKey>[] = [
  { key: 'all', label: '전체', match: () => true },
  {
    key: 'under5',
    label: '5만원 이하',
    match: (plan) => plan.monthlyFee <= 50000,
  },
  {
    key: '5to10',
    label: '5만원 ~ 10만원',
    match: (plan) => plan.monthlyFee > 50000 && plan.monthlyFee <= 100000,
  },
  {
    key: '10to20',
    label: '10만원 ~ 20만원',
    match: (plan) => plan.monthlyFee > 100000 && plan.monthlyFee <= 200000,
  },
  {
    key: '20to30',
    label: '20만원 ~ 30만원',
    match: (plan) => plan.monthlyFee > 200000 && plan.monthlyFee <= 300000,
  },
];

export const DATA_RANGE_OPTIONS: RangeOption<DataRangeKey>[] = [
  { key: 'all', label: '전체', match: () => true },
  {
    key: 'under500mb',
    label: '500MB 이하',
    match: (plan) => {
      const gb = parseDataGb(plan.data);
      return gb !== null && gb <= 0.5;
    },
  },
  {
    key: '500mbTo5gb',
    label: '500MB ~ 5GB',
    match: (plan) => {
      const gb = parseDataGb(plan.data);
      return gb !== null && gb > 0.5 && gb <= 5;
    },
  },
  {
    key: '5to10gb',
    label: '5GB ~ 10GB',
    match: (plan) => {
      const gb = parseDataGb(plan.data);
      return gb !== null && gb > 5 && gb <= 10;
    },
  },
  {
    key: '10to20gb',
    label: '10GB ~ 20GB',
    match: (plan) => {
      const gb = parseDataGb(plan.data);
      return gb !== null && gb > 10 && gb <= 20;
    },
  },
  {
    key: '20to40gb',
    label: '20GB ~ 40GB',
    match: (plan) => {
      const gb = parseDataGb(plan.data);
      return gb !== null && gb > 20 && gb <= 40;
    },
  },
  {
    key: 'unlimited',
    label: '무제한',
    match: (plan) => isUnlimitedData(plan.data),
  },
];

// target_age 는 '일반/키즈/청소년/청년/시니어/복지' enum 값을 그대로 담고 있다.
// 필터 UI에는 키즈/청소년/청년/복지만 노출하고, 일반·시니어는 '전체'에 포함된다.
export const AGE_GROUP_OPTIONS: RangeOption<AgeGroupKey>[] = [
  { key: 'all', label: '전체', match: () => true },
  {
    key: '키즈',
    label: '키즈 (만 4세 ~ 12세)',
    match: (plan) => plan.targetAge === '키즈',
  },
  {
    key: '청소년',
    label: '청소년 (만 13세 ~ 19세)',
    match: (plan) => plan.targetAge === '청소년',
  },
  {
    key: '청년',
    label: '청년 (만 19세 ~ 34세)',
    match: (plan) => plan.targetAge === '청년',
  },
  {
    key: '복지',
    label: '복지(장애인)',
    match: (plan) => plan.targetAge === '복지',
  },
];

export function matchesPlanFilter(
  plan: PlanDetailItem,
  filter: PlanFilterState,
): boolean {
  const price = PRICE_RANGE_OPTIONS.find((o) => o.key === filter.price);
  const data = DATA_RANGE_OPTIONS.find((o) => o.key === filter.data);
  const age = AGE_GROUP_OPTIONS.find((o) => o.key === filter.age);
  return (
    (price?.match(plan) ?? true) &&
    (data?.match(plan) ?? true) &&
    (age?.match(plan) ?? true)
  );
}

export type SortOption = 'recommended' | 'priceAsc' | 'priceDesc';

export const SORT_LABELS: Record<SortOption, string> = {
  recommended: '추천순',
  priceAsc: '낮은 가격순',
  priceDesc: '높은 가격순',
};

const SORT_ORDER: SortOption[] = ['recommended', 'priceAsc', 'priceDesc'];

export function nextSort(current: SortOption): SortOption {
  const index = SORT_ORDER.indexOf(current);
  return SORT_ORDER[(index + 1) % SORT_ORDER.length];
}

export function sortPlans(
  plans: PlanDetailItem[],
  sort: SortOption,
): PlanDetailItem[] {
  if (sort === 'recommended') return plans;
  const sorted = [...plans];
  sorted.sort((a, b) =>
    sort === 'priceAsc'
      ? a.monthlyFee - b.monthlyFee
      : b.monthlyFee - a.monthlyFee,
  );
  return sorted;
}
