import { requestConsult } from '@/lib/aiConsult';
import type { ConsultInput, ConsultResponse } from '@/lib/aiConsult';

const OTT_KEYWORDS = [
  '넷플릭스',
  '유튜브 프리미엄',
  '디즈니+',
  '왓챠',
  '웨이브',
  '쿠팡플레이',
  '애플 뮤직',
  '멜론',
  '스포티파이',
];

// 사용자 메시지에서 상담 조건(연령/데이터/예산/OTT 등)을 추출해 ConsultInput으로 누적합니다.
export function parseUserInput(text: string, prev: ConsultInput): ConsultInput {
  const next: ConsultInput = { ...prev, userMessage: text.trim() };
  const t = text.trim();

  const ageMatch = t.match(/(\d{1,2})\s*(?:살|세)/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    if (age < 20) next.ageGroup = '청소년';
    else if (age < 30) next.ageGroup = '20대';
    else if (age < 40) next.ageGroup = '30대';
    else if (age < 50) next.ageGroup = '40대';
    else next.ageGroup = '50대 이상';
  } else if (/청소년/.test(t)) next.ageGroup = '청소년';
  else if (/20대|직장인/.test(t)) next.ageGroup = '20대';
  else if (/30대/.test(t)) next.ageGroup = '30대';
  else if (/40대/.test(t)) next.ageGroup = '40대';
  else if (/50대|60대|어르신|시니어/.test(t)) next.ageGroup = '50대 이상';

  const gbMatch =
    t.match(/(\d+(?:\.\d+)?)\s*GB/i) ??
    t.match(/(\d+(?:\.\d+)?)\s*기가/i) ??
    t.match(/월\s*(\d+(?:\.\d+)?)\s*기가/i);
  if (gbMatch) {
    next.dataUsage = parseFloat(gbMatch[1]);
  } else if (/데이터\s*(?:많|큰)|많이\s*써|월\s*많게|용량\s*큰/.test(t)) {
    next.dataUsage = (next.dataUsage ?? 0) + 5;
    next.priority = 'data';
  }

  const budgetMatch = t.match(/(?:예산\s*)?(\d+)\s*만원/);
  if (budgetMatch) {
    next.budget = parseInt(budgetMatch[1], 10) * 10000;
  }

  if (/가장\s*저렴|싼|최저|절감/.test(t)) {
    next.priority = 'budget';
    if (next.budget === undefined) next.budget = 0;
  } else if (/데이터.*(?:많|큰)|용량.*큰|데이터\s*우선/.test(t)) {
    next.priority = 'data';
  } else if (/최대\s*데이터|완전\s*무제한/.test(t)) {
    next.priority = 'max_data';
  }

  // 빠른 답변(Quick Reply) 터치에 따른 조건 조정
  if (/데이터가\s*더\s*큰/.test(t)) {
    next.priority = 'data';
    next.dataUsage = (next.dataUsage ?? 0) + 5;
  } else if (/더\s*저렴한/.test(t)) {
    next.priority = 'budget';
    if (next.budget !== undefined)
      next.budget = Math.max(0, next.budget - 10000);
  } else if (/OTT\s*포함/.test(t)) {
    if (!next.ott || next.ott.length === 0) next.ott = ['넷플릭스'];
  } else if (/OTT\s*혜택\s*없는/.test(t)) {
    next.ott = [];
  } else if (/청소년\s*요금제/.test(t)) {
    next.ageGroup = '청소년';
  }

  const explicitNoOtt = /OTT\s*없|혜택\s*없/.test(t);
  for (const ott of OTT_KEYWORDS) {
    if (t.includes(ott)) {
      if (explicitNoOtt) continue;
      const current = next.ott ?? [];
      if (!current.includes(ott)) next.ott = [...current, ott];
    }
  }

  return next;
}

export async function postQuestion(
  text: string,
  prev: ConsultInput,
): Promise<{ input: ConsultInput; response: ConsultResponse }> {
  const input = parseUserInput(text, prev);
  const response = await requestConsult(input);
  return { input, response };
}
