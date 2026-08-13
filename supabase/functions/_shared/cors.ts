// 모든 Edge Function에서 공통으로 사용하는 CORS 헤더.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Preflight(OPTIONS) 요청에 대한 공통 응답 처리.
export function handleCorsPreflightRequest(): Response {
  return new Response('ok', { headers: corsHeaders });
}
