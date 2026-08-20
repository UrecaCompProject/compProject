// @ts-nocheck

/**
 * 관련 기능
 * - F-09 AI 요금제 추천
 * - F-10 추천 사유 생성
 *
 * 처리 방향
 * - Backend에서 사용자 정보와 후보 요금제 목록을 전달
 * - LLM이 후보 중 조건에 가장 적합한 상위 3개를 선택
 * - 조건에 딱 맞지 않는 경우 notice에 안내 문구를 작성
 */
export const recommendPromptText = `
통신 요금제 추천 AI입니다. 우선순위: {priority}.

[사용자 조건]
- 연령: {ageGroup}
- 데이터: {dataUsage}GB
- 예산: {budget}원
- 현재 요금제: {currentPlan}
- OTT: {ott}

[현재 상황]
{fallback}

[후보 요금제]
{plans}

[출력]
아래 JSON 형식으로만 답변하세요.
{
  "notice": "상황에 대한 1문장 안내(조건에 맞지 않을 때만), 맞으면 빈 문자열",
  "recommendations": [
    { "planId": "id1" },
    { "planId": "id2" },
    { "planId": "id3" }
  ]
}
`;
