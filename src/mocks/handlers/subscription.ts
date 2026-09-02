import { http, HttpResponse } from 'msw';

import {
  subscriptionApplications,
  subscriptionStatusLogs,
  termsConsents,
  mockSession,
} from '../db';

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

export const subscriptionHandlers = [
  // subscription_applications — POST (submitSubscription에서 insert + select('id').single())
  http.post(
    `${SUPABASE_URL}/rest/v1/subscription_applications`,
    async ({ request }) => {
      if (!mockSession) return unauthorizedResponse();
      const body = (await request.json()) as Record<string, unknown>;
      const newRow = {
        id: crypto.randomUUID(),
        requested_at: new Date().toISOString(),
        ...body,
      };
      subscriptionApplications.push(newRow);
      return HttpResponse.json({ id: newRow.id }, { status: 201 });
    },
  ),

  // subscription_status_logs — POST (submitSubscription에서 insert)
  http.post(
    `${SUPABASE_URL}/rest/v1/subscription_status_logs`,
    async ({ request }) => {
      if (!mockSession) return unauthorizedResponse();
      const body = (await request.json()) as Record<string, unknown>;
      const newRow = {
        id: crypto.randomUUID(),
        changed_at: new Date().toISOString(),
        ...body,
      };
      subscriptionStatusLogs.push(newRow);
      return HttpResponse.json(newRow, { status: 201 });
    },
  ),

  // terms_consents — POST (submitSubscription에서 insert 배열)
  http.post(`${SUPABASE_URL}/rest/v1/terms_consents`, async ({ request }) => {
    if (!mockSession) return unauthorizedResponse();
    const body = await request.json();
    const rows = Array.isArray(body) ? body : [body];
    for (const row of rows) {
      termsConsents.push({ id: crypto.randomUUID(), ...row });
    }
    return HttpResponse.json(rows, { status: 201 });
  }),
];
