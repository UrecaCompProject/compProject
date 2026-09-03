import { http, HttpResponse } from 'msw';

import {
  attendances,
  attendanceStreaks,
  userBadges,
  gameResults,
  coupons,
  products,
  exchanges,
  GAME_REWARD_BADGE_ID,
  mockSession,
} from '../db';
import {
  parseFilters,
  applyFilters,
  applyOrder,
  postgrestResponse,
  extractJoinTables,
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

// 배지 잔액 증가 (addBadgeBalance 로직 재현)
function addBadgeBalance(userId: string, badgeId: string, amount: number) {
  if (amount <= 0) return;
  const existing = userBadges.find(
    (ub) => ub.user_id === userId && ub.badge_id === badgeId,
  );
  if (existing) {
    existing.balance += amount;
    existing.total_earned += amount;
    existing.updated_at = new Date().toISOString();
  } else {
    userBadges.push({
      user_id: userId,
      badge_id: badgeId,
      balance: amount,
      total_earned: amount,
      updated_at: new Date().toISOString(),
    });
  }
}

export const rewardHandlers = [
  // === attendances ===
  http.get(`${SUPABASE_URL}/rest/v1/attendances`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(
      attendances as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request);
  }),

  // attendances POST (postCheckIn에서 insert + select)
  http.post(`${SUPABASE_URL}/rest/v1/attendances`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const body = (await request.json()) as Record<string, unknown>;
    const userId = body.user_id as string;
    const today = body.date as string;

    // 중복 출석 체크 (23505 unique violation 재현)
    const existing = attendances.find(
      (a) => a.user_id === userId && a.date === today,
    );
    if (existing) {
      return HttpResponse.json(
        {
          code: '23505',
          message: '오늘은 이미 출석체크를 완료했어요.',
        },
        { status: 409 },
      );
    }

    const newRow = { id: crypto.randomUUID(), ...body };
    attendances.push(newRow as (typeof attendances)[0]);

    return HttpResponse.json(
      { reward_value: body.reward_value },
      { status: 201 },
    );
  }),

  // === attendance_streaks ===
  http.get(`${SUPABASE_URL}/rest/v1/attendance_streaks`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const result = applyFilters(
      attendanceStreaks as unknown as Record<string, unknown>[],
      filters,
    );
    return postgrestResponse(result, request, true);
  }),

  // attendance_streaks POST (postCheckIn에서 upsert)
  http.post(
    `${SUPABASE_URL}/rest/v1/attendance_streaks`,
    async ({ request }) => {
      if (!mockSession) return unauthorizedResponse();
      const body = (await request.json()) as Record<string, unknown>;
      const prefer = request.headers.get('Prefer') ?? '';
      const userId = body.user_id as string;

      if (prefer.includes('merge-duplicates')) {
        const idx = attendanceStreaks.findIndex((s) => s.user_id === userId);
        if (idx >= 0) {
          attendanceStreaks[idx] = {
            ...attendanceStreaks[idx],
            ...body,
          } as (typeof attendanceStreaks)[0];
        } else {
          attendanceStreaks.push(body as (typeof attendanceStreaks)[0]);
        }
      }

      return HttpResponse.json(body, { status: 201 });
    },
  ),

  // === user_badges ===
  http.get(`${SUPABASE_URL}/rest/v1/user_badges`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(
      userBadges as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request, true);
  }),

  // user_badges POST (addBadgeBalance에서 upsert)
  http.post(`${SUPABASE_URL}/rest/v1/user_badges`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const body = (await request.json()) as Record<string, unknown>;
    const prefer = request.headers.get('Prefer') ?? '';
    const userId = body.user_id as string;
    const badgeId = body.badge_id as string;

    if (prefer.includes('merge-duplicates')) {
      const idx = userBadges.findIndex(
        (ub) => ub.user_id === userId && ub.badge_id === badgeId,
      );
      if (idx >= 0) {
        userBadges[idx] = {
          ...userBadges[idx],
          ...body,
        } as (typeof userBadges)[0];
      } else {
        userBadges.push(body as (typeof userBadges)[0]);
      }
    }

    return HttpResponse.json(body, { status: 201 });
  }),

  // user_badges PATCH (postExchange에서 balance 차감)
  http.patch(`${SUPABASE_URL}/rest/v1/user_badges`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const url = new URL(request.url);
    const body = (await request.json()) as Record<string, unknown>;
    const filters = parseFilters(url);

    userBadges.forEach((ub) => {
      const matches = filters.every((f) => {
        const val = ub[f.column as keyof typeof ub];
        return String(val) === f.value;
      });
      if (matches) {
        Object.assign(ub, body);
      }
    });

    return HttpResponse.json(body);
  }),

  // === game_results ===
  http.get(`${SUPABASE_URL}/rest/v1/game_results`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const result = applyFilters(
      gameResults as unknown as Record<string, unknown>[],
      filters,
    );
    return postgrestResponse(result, request, true);
  }),

  // game_results POST (recordGamePlay에서 insert)
  http.post(`${SUPABASE_URL}/rest/v1/game_results`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const body = (await request.json()) as Record<string, unknown>;
    const newRow = {
      id: crypto.randomUUID(),
      played_at: new Date().toISOString(),
      ...body,
    };
    gameResults.push(newRow as (typeof gameResults)[0]);

    // 게임 보상 배지 적립 (recordGamePlay 로직 재현)
    const score = body.score as number;
    if (score > 0) {
      addBadgeBalance(body.user_id as string, GAME_REWARD_BADGE_ID, score);
    }

    return HttpResponse.json(newRow, { status: 201 });
  }),

  // === products ===
  http.get(`${SUPABASE_URL}/rest/v1/products`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(
      products as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request);
  }),

  // === coupons ===
  http.get(`${SUPABASE_URL}/rest/v1/coupons`, ({ request }) => {
    const url = new URL(request.url);
    const selectParam = url.searchParams.get('select') ?? '';
    const joinTables = extractJoinTables(selectParam);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');

    let result = applyFilters(coupons, filters);
    result = applyOrder(result, orderParam);

    // products 조인 처리
    if (joinTables.includes('products')) {
      result = result.map((c) => ({
        ...c,
        products: products.find((p) => p.id === c.product_id) ?? null,
      }));
    }

    return postgrestResponse(result, request);
  }),

  // coupons POST (postExchange에서 insert)
  http.post(`${SUPABASE_URL}/rest/v1/coupons`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const body = (await request.json()) as Record<string, unknown>;
    const newRow = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body,
    };
    coupons.push(newRow);
    return HttpResponse.json(newRow, { status: 201 });
  }),

  // === exchanges ===
  http.post(`${SUPABASE_URL}/rest/v1/exchanges`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const body = (await request.json()) as Record<string, unknown>;
    const newRow = { id: crypto.randomUUID(), ...body };
    exchanges.push(newRow as (typeof exchanges)[0]);
    return HttpResponse.json(newRow, { status: 201 });
  }),
];
