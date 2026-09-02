// @ts-nocheck

/**
 * 관련 기능
 * - 일반 상담 대화 요약 리포트 (요금제 추천이 아닌 경우)
 *
 * 목적
 * - 게임/출석 내용이 제외된 대화 로그를 바탕으로 상담 내용 요약
 */
export const generalReportPromptText = `
[ROLE]

당신은 AI 통신 상담 대화 내용을 요약하는 역할을 담당합니다.


[상담 대화 기록]

{conversation}


[확정된 사용자 조건]

{userProfile}


[바뀐 요금제 정보]

{changedPlanInfo}


[RULES]

1. 실제 상담에서 확인된 정보만 사용하세요.

2. 사용자가 말하지 않은 조건을 임의로 추가하지 마세요.

3. 상담 내용을 그대로 반복하지 말고 핵심 질문과 답변을 요약하세요.

4. [바뀐 요금제 정보]가 "없음"이면 changedPlanAdvantage는 빈 문자열("")로 출력하세요.
   정보가 있으면 [바뀐 요금제 정보]에 제공된 가격/데이터/혜택만 사용해 변경된 요금제가
   기존 요금제보다 좋은 점을 200자 이내 자연스러운 문장으로 작성하세요. 존재하지 않는
   가격, 데이터, 혜택을 임의로 지어내지 마세요.


[OUTPUT 설명]

반드시 아래 형식의 유효한 JSON만 출력하세요.

- summary: 1-3문장으로 상담 핵심 질문과 답변을 요약하세요.
- usageType: 빈 문자열("")을 출력하세요.
- importantConditions: 상담에서 언급된 핵심 조건/키워드 0-3개를 문자열 배열로 작성하세요. 없으면 빈 배열.
- qaPairs: [확정된 사용자 조건]과 대화에서 실제 질문/답변 3-5개를 { question, answer } 객체 배열로 작성하세요. 없으면 빈 배열.
  메뉴나 안내 문구는 포함하지 마세요.
- changedPlanAdvantage: RULES 4를 따라 작성하세요.

{
  "summary": "string",
  "usageType": "",
  "importantConditions": ["string"],
  "qaPairs": [
    { "question": "string", "answer": "string" }
  ],
  "changedPlanAdvantage": "string"
}

JSON 이외의 추가 설명 문장은 포함하지 마세요.
`;
