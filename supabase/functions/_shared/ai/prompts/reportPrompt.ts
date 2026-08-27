// @ts-nocheck

/**
 * 관련 기능
 * - F-14 상담 레포트 저장
 *
 * 목적
 * - 상담 종료 후 대화 내용을 요약
 * - 추천 결과와 핵심 사용자 조건을 구조화
 */
export const reportPromptText = `
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

6. 절감액 정보가 존재하면 제공된 추천 결과의 savingAmount 값을 그대로 사용하세요.
   추천 결과에 절감액이 없거나 음수이면 0으로 설정하세요.

7. currentPlan이 비어 있거나 "미등록"이면 "미등록" 또는 "-"로 출력하세요.


[OUTPUT 설명]

반드시 아래 형식의 유효한 JSON만 출력하세요. 각 필드의 의미는 다음과 같습니다.

- summary: 1-2문장으로 상담 핵심만 요약하세요.
- usageType: 사용자의 데이터/통화 사용 패턴을 5-10자 명사구로 표현하세요.
  사용자가 명시한 조건(데이터량, 예산, OTT, 연령대, 통화 빈도) 중 가장 두드러진 특징을 반영하세요.
  예: "데이터 중심", "예산 민감", "OTT 활용", "가족 결합 우선", "통화 중심", "시니어 기본형", "청소년 데이터"
- currentPlan: 사용자의 현재 요금제 이름입니다. 없으면 "미등록"으로 하세요.
- recommendedPlans: 추천된 요금제의 "표시명(name)" 배열입니다.
  planId가 아닌 name을 사용하고, 추천된 순서를 유지하세요.
  예: ["5G 라이트+", "5G 프리미어"]
- recommendationReason: 2-3문장. 왜 이 요금제를 추천했는지 핵심 사유를 작성하세요.
  추천 결과에 제시된 사유를 요약형태로 재구성하되, 새로운 사유를 만들지 마세요.
- monthlySavingAmount: 월 절감 가능 금액(원, 정수).
  추천 결과의 savingAmount 중 첫 번째 추천 요금제의 절감액을 사용하세요.
  여러 요금제의 절감액을 합산하지 마세요. 없거나 음수이면 0으로 설정하세요.
- importantConditions: 추천 결정에 직접 영향을 준 핵심 조건 2-5개를 문자열 배열로 작성하세요.
  부가 정보(예: 가입 방식, 배송 주소)는 제외하고, 요금제 선택에 영향을 준 조건만 포함하세요.
  예: ["월 데이터 15GB 이상 사용", "OTT 넷플릭스 필수", "예산 5만원 이하", "청소년 요금제 필요"]

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
`;
