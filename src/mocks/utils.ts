import { HttpResponse } from 'msw';

// PostgREST 쿼리 파라미터에서 필터 조건을 파싱
// 예: user_id=eq.11111111&year_month=eq.2025-08&is_active=eq.true
export type FilterCondition = {
  column: string;
  operator: string;
  value: string;
};

export function parseFilters(url: URL): FilterCondition[] {
  const filters: FilterCondition[] = [];
  url.searchParams.forEach((value, key) => {
    // order, select, offset, limit은 필터가 아님
    if (['order', 'select', 'offset', 'limit', 'and', 'or'].includes(key))
      return;
    // Supabase SDK는 ?column=eq.value 형태로 보냄
    const match = value.match(
      /^(eq|neq|gt|gte|lt|lte|in|is|not\.eq|not\.gt|not\.gte|not\.lt|not\.lte|not\.in|not\.is)\.(.+)$/,
    );
    if (match) {
      filters.push({ column: key, operator: match[1], value: match[2] });
    }
  });
  return filters;
}

// 필터 조건에 따라 데이터 필터링
export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterCondition[],
): T[] {
  return data.filter((row) =>
    filters.every((filter) => {
      const colValue = row[filter.column];
      const filterValue = filter.value;

      switch (filter.operator) {
        case 'eq':
          if (filterValue === 'true')
            return colValue === true || colValue === 'true';
          if (filterValue === 'false')
            return colValue === false || colValue === 'false';
          return String(colValue) === filterValue;
        case 'neq':
          return String(colValue) !== filterValue;
        case 'gt':
          return Number(colValue) > Number(filterValue);
        case 'gte':
          return Number(colValue) >= Number(filterValue);
        case 'lt':
          return Number(colValue) < Number(filterValue);
        case 'lte':
          return Number(colValue) <= Number(filterValue);
        case 'in':
          return filterValue.split(',').includes(String(colValue));
        case 'is':
          if (filterValue === 'null') return colValue == null;
          if (filterValue === 'not.null') return colValue != null;
          return false;
        case 'not.eq':
          return String(colValue) !== filterValue;
        case 'not.is':
          if (filterValue === 'null') return colValue != null;
          return false;
        default:
          return true;
      }
    }),
  );
}

// order 파라미터 파싱 및 정렬 적용
// 예: order=sort_order.asc,created_at.desc
export function applyOrder<T extends Record<string, unknown>>(
  data: T[],
  orderParam: string | null,
): T[] {
  if (!orderParam) return data;

  const orders = orderParam.split(',').map((o) => {
    const [column, direction] = o.split('.');
    return { column, ascending: direction !== 'desc' };
  });

  return [...data].sort((a, b) => {
    for (const { column, ascending } of orders) {
      const aVal = a[column];
      const bVal = b[column];
      if (aVal === bVal) continue;
      const comparison =
        (aVal as unknown as string | number) <
        (bVal as unknown as string | number)
          ? -1
          : 1;
      return ascending ? comparison : -comparison;
    }
    return 0;
  });
}

// Accept 헤더로 single/maybeSingle 요청인지 확인
export function isObjectRequest(request: Request): boolean {
  const accept = request.headers.get('Accept') ?? '';
  return accept.includes('application/vnd.pgrst.object+json');
}

// PostgREST 응답 생성 — single/maybeSingle 여부에 따라 배열 또는 단일 객체 반환
export function postgrestResponse<T>(
  data: T[],
  request: Request,
  isMaybeSingle = false,
): Response {
  if (isObjectRequest(request)) {
    if (data.length === 0) {
      if (isMaybeSingle) {
        return HttpResponse.json(null, { status: 200 });
      }
      return new HttpResponse(null, { status: 406 });
    }
    return HttpResponse.json(data[0] as Record<string, unknown>);
  }
  return HttpResponse.json(data as Record<string, unknown>[]);
}

// select 파라미터에서 조인된 테이블 이름 추출
// 예: "plan_id, plans(*)" → ["plans"]
export function extractJoinTables(selectParam: string | null): string[] {
  if (!selectParam) return [];
  const joins: string[] = [];
  const regex = /(\w+)\([^)]*\)/g;
  let match;
  while ((match = regex.exec(selectParam)) !== null) {
    joins.push(match[1]);
  }
  return joins;
}
