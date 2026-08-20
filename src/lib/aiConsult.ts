import { supabase } from './supabaseClient';

export interface ConsultInput {
  currentPlan?: string;
  dataUsage?: number;
  voiceUsage?: number;
  smsUsage?: number;
  budget?: number;
  ageGroup?: string;
  ott?: string[];
  priority?: 'budget' | 'data' | 'max_data';
  userMessage?: string;
}

export interface RecommendedPlan {
  planId: string;
  planName: string;
  reason: string;
  savingAmount: number;
}

export interface ConsultResponse {
  recommendations: RecommendedPlan[];
  notice?: string;
  quickReplies?: string[];
}

// Supabase Edge Function 'ai-consult'를 호출하여 AI 요금제 추천 결과를 받습니다.
export async function requestConsult(
  input: ConsultInput,
): Promise<ConsultResponse> {
  const { data, error } = await supabase.functions.invoke<ConsultResponse>(
    'ai-consult',
    {
      body: input,
    },
  );

  if (error) {
    throw new Error(`AI 상담 요청 실패: ${error.message}`);
  }

  if (!data) {
    throw new Error('AI 상담 응답이 비어 있습니다.');
  }

  return data;
}
