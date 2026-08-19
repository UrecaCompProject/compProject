// @ts-nocheck
// AI 요금제 상담 Edge Function.
// 사용자 사용 패턴을 입력받아 Ollama 기반 LLM으로 추천 요금제, 사유, 절감액을 반환합니다.
import { corsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { generateQuickReplies, recommendPlan } from '../_shared/ai/chains.ts';
import type { ConsultRequest } from './types.ts';

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const body: ConsultRequest = await req.json();
    const result = await recommendPlan(body);
    const quickReplies = await generateQuickReplies(body, result);

    return new Response(JSON.stringify({ ...result, quickReplies }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
