import type { QuizKind } from '@/features/chat-quiz';
import type { GameId } from '@/features/games';

// 채팅 내에서 진행되는 게임 — 퀴즈는 useChatQuiz, 스크래치는 ScratchGame 컴포넌트
export type ChatGameId = 'ox' | 'multiple-choice' | 'scratch';

// 바텀시트(GameLayer)에서 진행되는 게임 — useGameStore.openGame으로 실행
export type SheetGameId = GameId; // 'card-match' | 'reaction' | 'attendance'

export type GameMeta = {
  id: ChatGameId | SheetGameId;
  title: string;
  description: string;
  type: 'chat' | 'sheet';
  icon: string; // lucide-react 아이콘 이름
  reward?: number;
};

// 채팅에서 진행하는 게임의 퀴즈 타입 매핑
export const CHAT_GAME_TO_QUIZ: Partial<Record<ChatGameId, QuizKind>> = {
  ox: 'ox',
  'multiple-choice': 'multiple-choice',
};

export const GAME_LIST: GameMeta[] = [
  {
    id: 'ox',
    title: '보안 OX 퀴즈',
    description: '보안 상식 OX 퀴즈를 풀고 배지를 받아요',
    type: 'chat',
    icon: 'ShieldCheck',
    reward: 1,
  },
  {
    id: 'multiple-choice',
    title: '통신 상식 퀴즈',
    description: '통신 상식 사지선다 퀴즈를 풀고 배지를 받아요',
    type: 'chat',
    icon: 'HelpCircle',
    reward: 1,
  },
  {
    id: 'scratch',
    title: '스크래치 이벤트',
    description: '스크래치 카드를 긁어 배지를 받아요',
    type: 'chat',
    icon: 'Sparkles',
    reward: 3,
  },
  {
    id: 'card-match',
    title: '카드 맞추기',
    description: '같은 그림의 카드를 찾아 배지를 받아요',
    type: 'sheet',
    icon: 'LayoutGrid',
    reward: 5,
  },
  {
    id: 'reaction',
    title: '반응속도 탭 게임',
    description: '10초에 가까운 타이밍에 탭해 배지를 받아요',
    type: 'sheet',
    icon: 'Timer',
    reward: 5,
  },
  {
    id: 'attendance',
    title: '출석 룰렛',
    description: '출석하고 룰렛을 돌려 혜택을 받아요',
    type: 'sheet',
    icon: 'Gift',
    reward: 5,
  },
];

// 게임 설명 — 채팅에서 진행하는 게임만 설명 제공
export const GAME_INTRO: Record<ChatGameId, string> = {
  ox: '보안 OX 퀴즈를 시작할게요!\n문제를 읽고 O 또는 X를 선택해 주세요.',
  'multiple-choice':
    '통신 상식 퀴즈를 시작할게요!\n보기 중 정답을 선택하고 확인 버튼을 눌러주세요.',
  scratch: '스크래치 이벤트를 시작할게요!\n카드를 긁어서 배지를 받아보세요.',
};
