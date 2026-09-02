import { http, HttpResponse } from 'msw';

import { plans, currentPlans, users, mockSession } from '../db';
import {
  parseFilters,
  applyFilters,
  applyOrder,
  postgrestResponse,
  extractJoinTables,
} from '../utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// PostgREST 미인증 에러 응답 — RLS 정책으로 인해 인증 없이 POST 시 반환
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

export const plansHandlers = [
  // plans 테이블 — GET (getPlanCatalog, getPlans, getReport에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/plans`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');

    let result = applyFilters(
      plans as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);

    return postgrestResponse(result, request);
  }),

  // plans 테이블 — POST (방어용)
  http.post(`${SUPABASE_URL}/rest/v1/plans`, () => {
    return HttpResponse.json([], { status: 201 });
  }),

  // current_plans 테이블 — GET (getCurrentPlan에서 사용, plans 조인 포함)
  http.get(`${SUPABASE_URL}/rest/v1/current_plans`, ({ request }) => {
    const url = new URL(request.url);
    const selectParam = url.searchParams.get('select') ?? '';
    const joinTables = extractJoinTables(selectParam);

    const userId = mockSession?.user.id;
    if (!userId) {
      return postgrestResponse([], request, true);
    }

    let result = currentPlans.filter((cp) => cp.user_id === userId);

    if (joinTables.includes('plans')) {
      result = result.map((cp) => ({
        ...cp,
        plans: plans.find((p) => p.id === cp.plan_id) ?? null,
      }));
    }

    return postgrestResponse(
      result as unknown as Record<string, unknown>[],
      request,
      true,
    );
  }),

  // current_plans 테이블 — POST (upsert, postChangePlan에서 사용)
  http.post(`${SUPABASE_URL}/rest/v1/current_plans`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const body = (await request.json()) as {
      user_id: string;
      plan_id: number;
      started_at: string;
    };
    const prefer = request.headers.get('Prefer') ?? '';

    if (prefer.includes('merge-duplicates')) {
      const idx = currentPlans.findIndex((cp) => cp.user_id === body.user_id);
      if (idx >= 0) {
        currentPlans[idx] = { ...currentPlans[idx], ...body };
      } else {
        currentPlans.push(body);
      }
    } else {
      currentPlans.push(body);
    }

    return HttpResponse.json(body, { status: 201 });
  }),

  // users 테이블 — GET (ensureUserProfile에서 select id만 조회)
  http.get(`${SUPABASE_URL}/rest/v1/users`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const result = applyFilters(
      users as unknown as Record<string, unknown>[],
      filters,
    );
    return postgrestResponse(result, request, true);
  }),

  // users 테이블 — POST (upsert, ensureUserProfile에서 사용)
  http.post(`${SUPABASE_URL}/rest/v1/users`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const body = (await request.json()) as Record<string, unknown>;
    const prefer = request.headers.get('Prefer') ?? '';

    if (prefer.includes('merge-duplicates')) {
      const idx = users.findIndex((u) => u.id === body.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...body } as (typeof users)[0];
      } else {
        users.push(body as (typeof users)[0]);
      }
    } else {
      users.push(body as (typeof users)[0]);
    }

    return HttpResponse.json(body, { status: 201 });
  }),
];
