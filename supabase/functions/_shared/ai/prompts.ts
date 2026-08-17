// AI 상담용 프롬프트 템플릿.
import { PromptTemplate } from 'npm:@langchain/core/prompts';

// 요금제 추천용 시스템 프롬프트.
export const recommendPrompt = PromptTemplate.fromTemplate(`
당신은 통신 요금제 전문 상담원입니다.
사용자의 사용 패턴과 예산을 분석하여 최적의 요금제를 추천하고, 추천 사유와 예상 절감액을 제시하세요.

[사용자 정보]
- 현재 요금제: {currentPlan}
- 월 데이터 사용량: {dataUsage}GB
- 월 통화량: {voiceUsage}분
- 월 문자량: {smsUsage}건
- 월 예산: {budget}원
- 주로 사용하는 OTT: {ott}

[요금제 목록]
{plans}

[출력 규칙]
1. 위 요금제 목록에서 상위 3개를 추천하세요.
2. 각 추천 요금제에 대해 id, 이름, 추천 사유, 예상 절감액(원)을 JSON 배열로 출력하세요.
3. 현재 요금제 정보가 부족하면 절감액을 0으로 처리할 수 있습니다.
4. 반드시 아래 형식의 유효한 JSON만 출력하세요. 추가 설명 문장은 포함하지 마세요.

{{"recommendations": [{{"planId": "string", "planName": "string", "reason": "string", "savingAmount": number}}]}}
`);

// 사용량 분석용 프롬프트.
export const usageAnalysisPrompt = PromptTemplate.fromTemplate(`
사용자의 최근 사용량을 분석하여 통찰을 제공하세요.

[최근 3개월 사용량]
{usageData}

[현재 요금제]
{currentPlan}

[출력 규칙]
1. 평균 사용량, 초과 사용 여부, 절감 가능성을 분석하세요.
2. 결과는 JSON 형식으로만 출력하세요.

{{"summary": "string", "averageDataUsageGB": number, "averageVoiceUsageMin": number, "averageSmsUsageCount": number, "overUsageLikely": boolean, "savingPotentialWon": number}}
`);
