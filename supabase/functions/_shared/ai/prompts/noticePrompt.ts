// @ts-nocheck

/**
 * 관련 기능
 * - F-09 AI 요금제 추천
 *
 * 처리 방향
 * - Backend에서 사용자 조건과 추천 후보 요금제를 전달
 * - LLM이 사용자에게 보여줄 1~2문장의 안내 문구(notice)를 작성
 */
export const noticePromptText = `
[사용자 조건]
- 연령: {ageGroup}
- 데이터: {dataUsage}GB
- 예산: {budget}원
- 현재 요금제: {currentPlan}
- OTT: {ott}
- 우선순위: {priority}

[현재 상황]
{fallback}

[추천 후보]
{plans}

[요청]
위 사용자 조건에 완벽히 맞지 않아서 후보 요금제를 보여주는 상황입니다.
후보 요금제들을 보여주는 이유와, 사용자가 원하는 조건에 맞추려면 예산/데이터/OTT 중 어떤 것을 어떻게 조정하면 좋은지 1~2문장으로 안내 문구를 작성하세요.
출력은 반드시 JSON 형식입니다: { "notice": "..." }
`;
