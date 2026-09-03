import { http, HttpResponse } from 'msw';

import { consultationReports, reportRecommendations, mockSession } from '../db';
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

export const consultReportHandlers = [
  // consultation_reports — GET (getReport에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/consultation_reports`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(consultationReports, filters);
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request);
  }),

  // consultation_reports — POST (saveReport에서 insert + select('id').single())
  http.post(
    `${SUPABASE_URL}/rest/v1/consultation_reports`,
    async ({ request }) => {
      if (!mockSession) return unauthorizedResponse();
      const body = (await request.json()) as Record<string, unknown>;
      const newRow = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...body,
      };
      consultationReports.push(newRow);
      return HttpResponse.json({ id: newRow.id }, { status: 201 });
    },
  ),

  // report_recommendations — GET (getReport에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/report_recommendations`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(
      reportRecommendations as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request);
  }),

  // report_recommendations — POST (saveReport에서 insert 배열)
  http.post(
    `${SUPABASE_URL}/rest/v1/report_recommendations`,
    async ({ request }) => {
      if (!mockSession) return unauthorizedResponse();
      const body = await request.json();
      const rows = Array.isArray(body) ? body : [body];
      for (const row of rows) {
        reportRecommendations.push(row as (typeof reportRecommendations)[0]);
      }
      return HttpResponse.json(rows, { status: 201 });
    },
  ),
];
