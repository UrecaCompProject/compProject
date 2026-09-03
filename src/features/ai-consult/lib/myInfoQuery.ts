import type { RecommendedPlan } from '@/shared/lib/aiConsult';

// "내 정보" 조회 질문 처리 — 로그인한 본인의 요금제/배지처럼 API로 조회 가능한
// 정보만 채팅에서 바로 답한다. 타인의 정보나 민감정보는 답하지 않는다.
export type MyInfoIntent = 'plan' | 'badge' | 'thirdParty' | 'sensitive';

// 3자(타인)를 지칭하는 표현 — 본인이 아닌 사람의 정보를 물으면 거절한다.
const THIRD_PARTY_RE =
  /(친구|타인|다른\s*사람|남의|옆사람|엄마|아빠|어머니|아버지|부모님|형|누나|언니|오빠|동생|와이프|아내|남편|여자친구|남자친구|애인|여친|남친|직장\s*동료|동료|그\s*사람|걔|쟤|이름이\s*\S+인)/;

// 민감정보 — 요금제/배지 문맥이라도 이런 값은 안내하지 않는다.
const SENSITIVE_RE =
  /(주민(등록)?\s*번호|주민번호|카드\s*번호|카드번호|계좌\s*번호|계좌번호|비밀\s*번호|비밀번호|password|cvc|보안\s*코드|결제\s*수단|결제수단|생년월일|집\s*주소|주소가\s*뭐)/i;

// "내 요금제 뭐야 / 무슨 요금제 쓰고 있어 / 현재 요금제 알려줘" 류
const PLAN_RE =
  /((내|나의|제)\s*)?(현재|지금)?\s*(요금제|요금\s*제|플랜|가입한\s*상품)\s*(가|는|이|을|를)?\s*(뭐|무엇|무슨|어떤|어느|이름|알려|알고|확인|보여|뭔지)/;
const PLAN_RE_ALT = /(무슨|어떤|어느)\s*요금제\s*(를)?\s*(쓰|사용|이용|가입)/;

// "배지 몇 개야 / 내 포인트 얼마 / 배지 얼마나 있어" 류
const BADGE_RE =
  /((내|나의|제)\s*)?(게임\s*)?(배지|뱃지|포인트|리워드|적립금)\s*(가|는|이|을|를)?\s*(몇|얼마|개수|갯수|얼만큼|얼마나|보유|알려|확인|있어|남았)/;

// 요금/결제/배지 등 계정 데이터를 언급하는지 — 민감정보 거절을 이 문맥으로 한정해
// 관계없는 대화까지 가로채지 않게 한다.
const ACCOUNT_CONTEXT_RE =
  /(요금제|요금|플랜|배지|뱃지|포인트|리워드|적립금|결제|카드|계좌|납부)/;

export function detectMyInfoIntent(text: string): MyInfoIntent | null {
  const t = text.replace(/\s+/g, ' ').trim();

  // 계정 관련 문맥에서 민감정보를 물으면 질문 형태와 무관하게 거절한다.
  if (SENSITIVE_RE.test(t) && ACCOUNT_CONTEXT_RE.test(t)) return 'sensitive';

  const asksPlan = PLAN_RE.test(t) || PLAN_RE_ALT.test(t);
  const asksBadge = BADGE_RE.test(t);
  if (!asksPlan && !asksBadge) return null;

  if (SENSITIVE_RE.test(t)) return 'sensitive';
  if (THIRD_PARTY_RE.test(t)) return 'thirdParty';
  return asksBadge ? 'badge' : 'plan';
}

interface MyInfoData {
  isLoggedIn: boolean;
  currentPlan: RecommendedPlan | null | undefined;
  badgeBalance: number;
}

// 요금제명·가격·데이터·배지 개수를 강조 색으로 렌더링하기 위한 구조화 데이터.
// (거절/로그인 안내에는 없음 — 평문 sentence만 쓴다.)
export type MyInfoContent =
  | { kind: 'plan'; planName: string; fee?: string; dataAmount?: string }
  | { kind: 'badge'; count: number };

export interface MyInfoAnswer {
  sentence: string;
  quickReplies: string[];
  content?: MyInfoContent;
}

const LOGIN_REQUIRED: MyInfoAnswer = {
  sentence: '내 정보는 로그인 후에 확인할 수 있어요. 먼저 로그인해 주세요.',
  quickReplies: ['회원 가입하기', '메뉴로 돌아가기'],
};

export function buildMyInfoAnswer(
  intent: MyInfoIntent,
  { isLoggedIn, currentPlan, badgeBalance }: MyInfoData,
): MyInfoAnswer {
  if (intent === 'sensitive') {
    return {
      sentence:
        '주민등록번호, 카드 정보, 비밀번호 같은 민감한 개인정보는 알려드릴 수 없어요. 요금제나 배지처럼 조회 가능한 정보만 안내해 드릴 수 있어요.',
      quickReplies: ['메뉴로 돌아가기'],
    };
  }

  if (intent === 'thirdParty') {
    return {
      sentence:
        '다른 분의 정보는 알려드릴 수 없어요. 본인 계정으로 로그인하면 본인의 요금제와 배지 정보를 확인할 수 있어요.',
      quickReplies: ['메뉴로 돌아가기'],
    };
  }

  if (!isLoggedIn) return LOGIN_REQUIRED;

  if (intent === 'badge') {
    return {
      sentence: `현재 보유하신 배지는 총 ${badgeBalance.toLocaleString('ko-KR')}개예요.`,
      quickReplies: ['게임 하기', '출석체크', '메뉴로 돌아가기'],
      content: { kind: 'badge', count: badgeBalance },
    };
  }

  // intent === 'plan'
  if (!currentPlan) {
    return {
      sentence:
        '가입된 요금제 정보를 찾지 못했어요. 마이페이지에서 확인하거나 요금제 추천을 받아보실래요?',
      quickReplies: ['요금제 추천받기', '메뉴로 돌아가기'],
    };
  }

  const fee =
    currentPlan.monthlyFee !== undefined
      ? `${currentPlan.monthlyFee.toLocaleString('ko-KR')}원`
      : undefined;
  const dataAmount = currentPlan.data || undefined;

  const parts = [`현재 이용 중인 요금제는 ${currentPlan.planName}이에요.`];
  const detail: string[] = [];
  if (fee) detail.push(`월 ${fee}`);
  if (dataAmount) detail.push(`데이터 ${dataAmount}`);
  if (detail.length > 0) parts.push(detail.join(' · '));

  return {
    sentence: parts.join('\n'),
    quickReplies: ['요금제 비교하기', '요금제 추천받기', '메뉴로 돌아가기'],
    content: { kind: 'plan', planName: currentPlan.planName, fee, dataAmount },
  };
}
