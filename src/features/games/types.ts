export type {
  GameComponentProps,
  GameDefinition,
  GameId,
} from '@/shared/types/games';

/** 미니게임 공통 진행 단계 (GameShell이 이 값으로 화면을 갈아끼운다) */
export type GamePhase = 'intro' | 'playing' | 'result';

/** 게임 시작 전 보여주는 규칙 안내 한 단계 (GameRulesCard의 ol 항목 하나) */
export type GameRuleStep = {
  title: string;
  description: string;
};

/** GameRulesCard에 넘기는 안내 콘텐츠. 카드 뒤집기/스피드 탭/출석 룰렛처럼
 * 시작 전 규칙 안내가 필요한 게임들이 공통으로 사용한다. */
export type GameRuleContent = {
  image: string;
  title: string;
  subtitle: string;
  steps: GameRuleStep[];
  ctaLabel: string;
};
