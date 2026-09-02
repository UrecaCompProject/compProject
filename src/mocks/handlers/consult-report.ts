import { http, HttpResponse } from 'msw';

import { consultationReports, reportRecommendations } from '../db';
import {
  parseFilters,
  applyFilters,
  applyOrder,
  postgrestResponse,
} from '../utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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
      const body = await request.json();
      const rows = Array.isArray(body) ? body : [body];
      for (const row of rows) {
        reportRecommendations.push(row as (typeof reportRecommendations)[0]);
      }
      return HttpResponse.json(rows, { status: 201 });
    },
  ),
];
