import { PromptTemplate } from 'npm:@langchain/core/prompts';

/**
 * 관련 기능
 * - F-14 상담 레포트 저장
 *
 * 목적
 * - 상담 종료 후 대화 내용을 요약
 * - 추천 결과와 핵심 사용자 조건을 구조화
 */
export const reportPrompt = PromptTemplate.fromTemplate(`
[ROLE]

당신은 AI 통신 요금제 상담 내용을 요약하는 역할을 담당합니다.


[상담 내용]

{conversation}


[현재 요금제]

{currentPlan}


[최종 추천 결과]

{recommendationResult}


[RULES]

1. 실제 상담에서 확인된 정보만 사용하세요.

2. 사용자가 말하지 않은 조건을 임의로 추가하지 마세요.

3. 실제 추천되지 않은 요금제를 추가하지 마세요.

4. 추천 결과와 추천 사유를 임의로 변경하지 마세요.

5. 상담 내용을 그대로 반복하지 말고
   저장 및 조회에 필요한 핵심 결과만 요약하세요.

6. 절감액 정보가 존재하면 제공된 값을 사용하세요.


[OUTPUT]

반드시 아래 형식의 유효한 JSON만 출력하세요.

{{
  "summary": "string",
  "usageType": "string",
  "currentPlan": "string",
  "recommendedPlans": ["string"],
  "recommendationReason": "string",
  "monthlySavingAmount": number,
  "importantConditions": ["string"]
}}

JSON 이외의 추가 설명 문장은 포함하지 마세요.
`);