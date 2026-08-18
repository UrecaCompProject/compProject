import { PromptTemplate } from 'npm:@langchain/core/prompts';

/**
 * 관련 기능
 * - F-08 사용자 조건 분석
 * - F-25 사용 패턴 분석
 *
 * 목적
 * - 최근 3개월 사용량과 현재 요금제를 비교
 * - 사용 패턴과 초과 사용 가능성을 분석
 */
export const usageAnalysisPrompt = PromptTemplate.fromTemplate(`
[ROLE]

당신은 사용자의 통신 사용 패턴을 분석하는 AI 상담원입니다.

최근 3개월 사용량과 현재 요금제를 비교하여
사용자의 통신 이용 패턴을 분석하세요.


[최근 3개월 사용량]

{usageData}


[현재 요금제]

{currentPlan}


[분석 기준]

1. 최근 3개월 데이터 사용량의 평균과 흐름을 분석하세요.

2. 최근 3개월 통화량의 평균과 흐름을 분석하세요.

3. 최근 3개월 문자 사용량의 평균과 흐름을 분석하세요.

4. 현재 요금제의 제공량과 실제 사용량을 비교하세요.

5. 현재 제공량을 지속적으로 초과하고 있는지 확인하세요.

6. 현재 제공량에 비해 실제 사용량이 현저히 적은지도 확인하세요.

7. 월별 사용량 차이가 큰 경우 사용량 변동이 크다는 점을 반영하세요.


[RULES]

1. 반드시 제공된 데이터만 사용하세요.

2. 존재하지 않는 사용량을 임의로 생성하지 마세요.

3. 데이터가 없는 항목은 임의로 추측하지 마세요.

4. 현재 요금제와 비교할 수 없는 항목은 사실처럼 판단하지 마세요.

5. 절감 가능 금액을 정확하게 계산할 수 없는 경우
   임의의 금액을 생성하지 마세요.


[OUTPUT]

반드시 아래 형식의 유효한 JSON만 출력하세요.

{{
  "summary": "string",
  "averageDataUsageGB": number,
  "averageVoiceUsageMin": number,
  "averageSmsUsageCount": number,
  "overUsageLikely": boolean,
  "savingPotentialWon": number
}}

JSON 이외의 추가 설명 문장은 포함하지 마세요.
`);