// @ts-nocheck


/**
 * 관련 기능
 * - F-09 AI 요금제 추천
 * - F-10 추천 사유 생성
 *
 * 처리 방향
 * - Backend에서 사용자 정보와 전체 요금제 목록을 전달
 * - LLM이 사용자 조건을 분석
 * - LLM이 전체 요금제 목록에서 적합한 상위 3개를 직접 선정
 * - LLM이 추천 사유를 생성
 */
export const recommendPromptText = `
통신 요금제 추천 AI입니다. 사용자의 우선순위는 {priority}입니다.
아래 후보 목록 안에서 조건에 맞는 요금제 3개의 id를 반드시 골라 JSON으로 반환하세요.

[사용자 조건]
- 현재 요금제: {currentPlan}
- 월 데이터 사용량: {dataUsage}GB
- 월 예산: {budget}원
- 연령대: {ageGroup}
- 선호 OTT: {ott}
- 우선순위: {priority} (budget=예산 우선, data=데이터 용량 우선)

[필수 규칙]
1. 반드시 아래 후보 목록 안의 id만 사용하세요.
2. 예산 {budget}원 이하여야 합니다.
3. {priority}가 'budget'이면: 예산 내에서 데이터가 {dataUsage}GB에 가장 가까운 요금제 3개를 반환하세요. {dataUsage}GB 이상이 없으면 예산 내 가장 데이터가 많은 요금제 3개를 반환하세요.
4. {priority}가 'data'이면: 예산 {budget}원 이하 중 데이터가 {dataUsage}GB 이상인 요금제 중 가장 저렴한 3개를 반환하세요. 없으면 예산 내 가장 데이터가 많은 요금제 3개를 반환하세요.
5. {ott} 혜택이 있는 요금제는 동일 조건에서 1순위로 고려하세요.
6. id1, id2, id3은 예시입니다. 실제 후보 목록의 id를 사용하세요.
7. 반드시 요금제 3개를 모두 반환하세요.
8. 출력은 JSON만, 다른 말은 하지 마세요.

[후보 요금제]
{plans}

[OUTPUT]
{{
  "recommendations": [
    {{"planId": "id1"}},
    {{"planId": "id2"}},
    {{"planId": "id3"}}
  ]
}}
`;


