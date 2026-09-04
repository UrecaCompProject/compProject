import type { ChatMenuSheet } from '../model/useChatMenuSheetStore';

// "마이페이지 보여줘", "전체 요금제 알려줘", "이벤트 페이지 보여줘", "리포트 보여줘"
// 처럼 메뉴 이름을 채팅으로 말했을 때 여는 바텀시트를 판별한다.
//
// 일반 상담 질문("이 요금제 혜택 뭐야" 등)을 가로채지 않도록, 페이지/메뉴를
// 보고 싶다는 뜻이 분명한 표현으로만 매칭한다. 요금제는 "내 요금제 뭐야"(본인
// 정보 조회)·"요금제 추천받기/비교하기"(기존 퀵리플라이)보다 뒤에서 판별된다.
const RULES: { sheet: ChatMenuSheet; re: RegExp }[] = [
  { sheet: 'mypage', re: /마이\s*페이지/ },
  {
    sheet: 'plan',
    re: /(전체|모든)\s*요금제|요금제\s*(목록|리스트|전체|메뉴|종류)|어떤\s*요금제(들)?\s*(가|이)?\s*있/,
  },
  {
    sheet: 'reward',
    // "혜택/이벤트 페이지", "이벤트 페이지 보여줘", "혜택 이벤트", "이벤트 보여줘"
    re: /(혜택|이벤트|리워드|프로모션)[^가-힣]{0,4}(페이지|메뉴|센터|탭|목록)|혜택[^가-힣]{0,2}이벤트|이벤트\s*(을|를)?\s*(보여|보고|알려|확인|볼래|보러)/,
  },
  {
    sheet: 'report',
    re: /(상담\s*)?리포트/,
  },
];

const ACTION_RE =
  /(보여|보고\s*싶|알려|열어|가고\s*싶|이동|확인|볼래|보러|있(나|어|을까|는지)|어디|무엇|뭐가?\s*있)/;

export function detectMenuSheet(text: string): ChatMenuSheet | null {
  const t = text.replace(/\s+/g, ' ').trim();

  for (const { sheet, re } of RULES) {
    if (!re.test(t)) continue;
    // report/plan/reward는 명사 자체가 메뉴명이라 짧은 문장이면 바로 연다.
    // 그 외에는 열람 의도가 함께 있어야 오작동을 막는다.
    if (t.length <= 14 || ACTION_RE.test(t)) return sheet;
  }
  return null;
}

const OPEN_MESSAGE: Record<ChatMenuSheet, string> = {
  mypage: '마이페이지를 열어드릴게요.',
  plan: '요금제 메뉴를 열어드릴게요.',
  reward: '혜택·이벤트 메뉴를 열어드릴게요.',
  report: '상담 리포트를 열어드릴게요.',
};

export function menuSheetOpenMessage(sheet: ChatMenuSheet): string {
  return OPEN_MESSAGE[sheet];
}
