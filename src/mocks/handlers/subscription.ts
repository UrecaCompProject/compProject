import { http, HttpResponse } from 'msw';

import {
  subscriptionApplications,
  subscriptionStatusLogs,
  termsConsents,
} from '../db';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const subscriptionHandlers = [
  // subscription_applications — POST (submitSubscription에서 insert + select('id').single())
  http.post(
    `${SUPABASE_URL}/rest/v1/subscription_applications`,
    async ({ request }) => {
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
    const body = await request.json();
    const rows = Array.isArray(body) ? body : [body];
    for (const row of rows) {
      termsConsents.push({ id: crypto.randomUUID(), ...row });
    }
    return HttpResponse.json(rows, { status: 201 });
  }),
];
