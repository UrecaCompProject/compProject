// 린트/포맷 검증용 최소 예시 Edge Function.
// 실제 서비스 함수로 교체하거나 삭제하면 됩니다.

import { corsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  const url = new URL(req.url);
  const name = url.searchParams.get('name') ?? 'world';

  return new Response(JSON.stringify({ message: `Hello ${name}` }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
