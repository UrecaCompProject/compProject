import type { ComponentType, ReactNode } from 'react';

/** 등록된 게임 id. registry.ts의 key와 항상 일치해야 함.
 * scratch(스크래치 이벤트)는 바텀시트가 아니라 채팅에서 진행하므로 제외 */
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

// 게임을 어디서 시작했는지 — 끝났을 때 어느 바텀시트로 돌아갈지 결정한다.
export type GameSource = 'chat' | 'reward';

export type GameOpenParams = {
  reward?: number;
  onWin?: (reward: number) => void;
  source?: GameSource;
};

export type ActiveGameMeta = {
  title: string;
  source: GameSource;
  onBack: () => void;
};

/** RewardSheet 등 외부 feature가 games 기능을 주입받을 때 사용하는 슬롯 타입 */
export interface GameInfrastructure {
  GameLayer: ComponentType<{ children: ReactNode }>;
  isGameId: (id: string) => id is GameId;
  activeGameMeta: ActiveGameMeta | null;
  openGame: (gameId: GameId, params?: GameOpenParams) => void;
  closeGame: () => void;
}
