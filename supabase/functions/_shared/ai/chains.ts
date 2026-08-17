// LangChain 기반 체인 및 AI 상담 실행 로직.
import { RunnableSequence } from 'npm:@langchain/core/runnables';
import { StringOutputParser } from 'npm:@langchain/core/output_parsers';
import { ollama } from './ollama.ts';
import { recommendPrompt, usageAnalysisPrompt } from './prompts.ts';
import { loadPlans } from './data.ts';
import type {
  ConsultInput,
  RecommendOutput,
  UsageAnalysisOutput,
} from './types.ts';

const recommendChain = RunnableSequence.from([
  recommendPrompt,
  ollama,
  new StringOutputParser(),
]);
const usageAnalysisChain = RunnableSequence.from([
  usageAnalysisPrompt,
  ollama,
  new StringOutputParser(),
]);

// JSON 문자열을 안전하게 파싱. LLM이 마크다운 코드 블록으로 감싸 출력할 경우 제거.
function safeJsonParse<T>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/, '')
    .replace(/```\s*$/, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

// 상위 3개 요금제 추천 및 사유, 절감액 산출.
export async function recommendPlan(
  input: ConsultInput,
): Promise<RecommendOutput> {
  const plans = await loadPlans();
  const planText = plans
    .map(
      (p) =>
        `- ${p.id}: ${p.name} (데이터 ${p.dataGB}GB, 통화 ${p.voiceMin}분, 문자 ${p.smsCount}건, 월 ${p.price}원, OTT: ${p.ott?.join(',') || '없음'})`,
    )
    .join('\n');

  const raw = await recommendChain.invoke({
    currentPlan: input.currentPlan || '미등록',
    dataUsage: input.dataUsage ?? 0,
    voiceUsage: input.voiceUsage ?? 0,
    smsUsage: input.smsUsage ?? 0,
    budget: input.budget ?? 0,
    ott: input.ott?.join(', ') || '없음',
    plans: planText,
  });

  return safeJsonParse<RecommendOutput>(raw);
}

// 최근 사용량 기반 패턴 분석.
export async function analyzeUsage(input: {
  currentPlan: string;
  usageHistory: {
    month: string;
    dataGB: number;
    voiceMin: number;
    smsCount: number;
  }[];
}): Promise<UsageAnalysisOutput> {
  const usageText = input.usageHistory
    .map(
      (u) =>
        `- ${u.month}: 데이터 ${u.dataGB}GB, 통화 ${u.voiceMin}분, 문자 ${u.smsCount}건`,
    )
    .join('\n');

  const raw = await usageAnalysisChain.invoke({
    usageData: usageText,
    currentPlan: input.currentPlan,
  });

  return safeJsonParse<UsageAnalysisOutput>(raw);
}
