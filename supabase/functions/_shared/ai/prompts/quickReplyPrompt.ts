import { PromptTemplate } from 'npm:@langchain/core/prompts';

/**
 * 관련 기능
 * - F-12 Quick Reply 제공
 *
 * 목적
 * - 현재 상담 맥락과 추천 결과를 기반으로
 *   사용자가 이어서 선택할 수 있는 후속 질문 생성
 */
export const quickReplyPrompt = PromptTemplate.fromTemplate(`
[ROLE]

현재 AI 상담 맥락에 적합한 Quick Reply를 생성하세요.


[사용자 메시지]

{userMessage}


[AI 응답]

{assistantResponse}


[추천 결과]

{recommendationResult}


[RULES]

1. 최대 3개의 Quick Reply를 생성하세요.

2. 현재 상담 내용과 직접 관련된 질문만 생성하세요.

3. 사용자가 이미 제공한 정보를 다시 질문하지 마세요.

4. 추천 결과를 비교하거나 조건을 조정할 수 있는 질문을 우선하세요.

5. 현재 상담과 관계없는 질문은 생성하지 마세요.

6. 추천된 요금제끼리 차이를 확인하거나
   더 저렴한 조건, 혜택 조건 등을 확인할 수 있는 질문을 우선 고려하세요.


[OUTPUT]

반드시 아래 형식의 유효한 JSON만 출력하세요.

{{
  "quickReplies": [
    "string",
    "string",
    "string"
  ]
}}

JSON 이외의 추가 설명 문장은 포함하지 마세요.
`);