import { http, HttpResponse } from 'msw';

import { usageMonthly, mockSession } from '../db';
import {
  parseFilters,
  applyFilters,
  applyOrder,
  postgrestResponse,
} from '../utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// PostgREST 미인증 에러 응답
function unauthorizedResponse() {
  return HttpResponse.json(
    {
      code: 'PGRST301',
      message: '로그인이 필요해요. 다시 로그인해 주세요.',
      details: 'JWT is missing or invalid',
    },
    { status: 401 },
  );
}

export const usageHandlers = [
  // usage_monthly — GET (getUsage, getUsageTrend에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/usage_monthly`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');

    let result = applyFilters(
      usageMonthly as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);

    return postgrestResponse(result, request);
  }),

  // usage_monthly — POST (insert, ensureCurrentMonthUsage에서 사용)
  http.post(`${SUPABASE_URL}/rest/v1/usage_monthly`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const body = (await request.json()) as Record<string, unknown>;
    const newRow = {
      id: crypto.randomUUID(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    usageMonthly.push(newRow as (typeof usageMonthly)[0]);
    return HttpResponse.json(newRow, { status: 201 });
  }),
];
