import type { ComponentType } from 'react';

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
