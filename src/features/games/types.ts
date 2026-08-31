import type { ComponentType } from 'react';

/** 등록된 게임 id. registry.ts의 key와 항상 일치해야 함.
 * scratch(스크래치 이벤트)는 바텀시트가 아니라 채팅에서 진행하므로 제외 — ScratchGameMessage 참고 */
export type GameId = 'card-match' | 'reaction' | 'attendance';

export type GameComponentProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
};

export type GameDefinition = {
  title: string;
  component: ComponentType<GameComponentProps>;
};

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
